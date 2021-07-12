const dotenv = require('dotenv')
dotenv.config()
const request = require('supertest')('http://127.0.0.1:3000')
const { Misc, Db } = require('../../../../middleware/index')

describe('GET /account/status/user/:user', () => {
  let csrf_header, urn1, urn2, settings

  const fixtures = {
    username: '_' + Misc.getRandomStr(20),
    mail: '_' + Misc.getRandomStr(20) + '@units_tests.na',
    password: '',
    firstname: '',
    lastname: '',
    is_lock: 0,
  }
  const non_existent_data = '_' + Misc.getRandomStr(25)

  beforeAll(async () => {
    // Restaure la table settings au paramètres d'origines
    select = await Db.get({
      query: 'SELECT maintenance,can_create_account FROM settings LIMIT 1',
    })
    settings = select && select[0]

    await Db.merge({
      query: 'UPDATE settings SET ? LIMIT 1',
      preparedStatement: [{ maintenance: 0, can_create_account: 1 }],
    })
    // Restaure la table settings au paramètres d'origines

    csrf_header = await request
      .get('/csrf/generate')
      .set({ 'csrf-token': '' })
      .then((response) => response.body.csrf_token)
    if (!csrf_header) csrf_header = ''
  })

  afterAll(async () => {
    // Restaure la table settings au paramètres administrateurs
    await Db.merge({
      query: 'UPDATE settings SET ? LIMIT 1',
      preparedStatement: [settings],
    })
    // Restaure la table settings au paramètres administrateurs

    // Restaure l'auto incrémentation
    await Db.merge({
      query: 'ALTER TABLE `account` auto_increment = 1;',
    })
    // Restaure l'auto incrémentation
  })

  it('Create fixtures', async (done) => {
    let inserted_row = 0

    const select = await Db.get({
      query: 'SELECT id FROM account WHERE username = ? OR mail = ? LIMIT 1',
      preparedStatement: [fixtures.username, fixtures.mail],
    })

    if (!select[0]) {
      inserted_row = await Db.commit({
        query: 'INSERT INTO account SET ?',
        preparedStatement: [fixtures],
      })
    }

    urn1 = request.get('/account/status/user/' + non_existent_data)
    urn2 = request.get('/account/status/user/' + fixtures.username)

    expect(inserted_row).toBeGreaterThanOrEqual(1)
    done()
  })
  it('Réponse HTTP', async (done) => {
    await urn1
      .set('csrf-token', csrf_header)
      .then((response) => expect(response.statusCode).toBe(200))

    await urn2
      .set('csrf-token', csrf_header)
      .then((response) => expect(response.statusCode).toBe(200))

    done()
  })
  it('Ask a csrf token', async (done) => {
    expect(csrf_header).toBeDefined()
    expect(csrf_header).not.toBe('')
    done()
  })
  describe('If isAvailable is true', () => {
    let body

    beforeAll(async () => {
      body = await urn1
        .set('csrf-token', csrf_header)
        .then((response) => response.body)
    })

    it('isAvailable must be true', (done) => {
      expect(body.isAvailable).toBeTruthy()
      done()
    })
    it('isLocked must be undefined', (done) => {
      expect(body.isLocked).toBeUndefined()
      done()
    })
  })

  describe('If isAvailable is false', () => {
    let body

    beforeAll(async () => {
      body = await urn2
        .set('csrf-token', csrf_header)
        .then((response) => response.body)
    })

    it('isAvailable must be false', (done) => {
      expect(body.isAvailable).toBeFalsy()
      done()
    })
    it('isLocked must be false', (done) => {
      expect(body.isLocked).toBeFalsy()
      done()
    })
  })

  describe('Mode maintenance', () => {
    let body

    beforeAll(async () => {
      // On active le mode maintenance sur l'Api
      await Db.merge({
        query: 'UPDATE settings SET ? LIMIT 1',
        preparedStatement: [{ maintenance: 1 }],
      })
      // On active le mode maintenance sur l'Api

      body = await request
        .get('/account/status/user/' + fixtures.username)
        .set('csrf-token', csrf_header)
        .then((response) => response.body)
    })

    it('isAvailable always Truthy', (done) => {
      expect(body.isAvailable).toBeTruthy()
      done()
    })
  })

  it('Delete fixtures', async (done) => {
    const row_deleted = await Db.delete({
      query: 'DELETE FROM account WHERE ? LIMIT 1',
      preparedStatement: { username: fixtures.username },
    })
    expect(row_deleted).toBeGreaterThanOrEqual(1)
    done()
  })
})
