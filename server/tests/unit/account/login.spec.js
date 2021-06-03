const dotenv = require('dotenv')
dotenv.config()
const request = require('supertest')('http://127.0.0.1:3000')
const { Misc, Db, Password } = require('../../../middleware/index')

describe('POST /account/login', () => {
  let csrf_header, fixtures, settings
  const urn = '/account/login'

  beforeAll(async () => {
    if (!csrf_header) {
      csrf_header = await request
        .get('/csrf/generate')
        .then((response) => response.body.csrf_token)
      if (!csrf_header) csrf_header = ''
    }
  })

  describe('Fixtures', () => {
    it('Create fixtures', async (done) => {
      let select

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

      fixtures = {
        username: '_' + Misc.getRandomStr(15),
        mail: '_' + Misc.getRandomStr(20) + '@units_tests.na',
        password: await Password.hash('&_tests_units'),
        firstname: 'Tests',
        lastname: 'UNITS',
        is_lock: 0,
        jwt_hash: '__tests_units',
      }

      let inserted_row = 0

      select = await Db.get({
        query: 'SELECT id FROM account WHERE username = ? OR mail = ? LIMIT 1',
        preparedStatement: [fixtures.username, fixtures.mail],
      })

      if (!select[0]) {
        inserted_row = await Db.commit({
          query: 'INSERT INTO account SET ?',
          preparedStatement: [fixtures],
        })
      }

      expect(inserted_row).toBeGreaterThanOrEqual(1)
      done()
    })
  })

  describe('Login successfull', () => {
    let response
    const expected_values = {
      isLock: false,
      isLoggedIn: true,
      isAdmin: false,
      firstName: 'Tests',
      lastName: 'UNITS',
      toastMessage: [],
      // access_token: response.access_token,
    }

    beforeAll(async () => {
      if (!response) {
        response = await request
          .post(urn)
          .set('csrf-token', csrf_header)
          .send({
            params: { user: fixtures.username, password: '&_tests_units' },
          })
          .then((response) => response.body)
      }
    })

    for (const [key, value] of Object.entries(expected_values)) {
      it(`${key}`, (done) => {
        expect(response[key]).toStrictEqual(value)
        done()
      })
    }
    it(`access_token`, (done) => {
      expect(response.access_token.length).toBeGreaterThanOrEqual(1)
      done()
    })
  })

  describe('Login fail with fake username or password', () => {
    let response
    const expected_values = {
      isLock: false,
      isLoggedIn: false,
      isAdmin: false,
      toastMessage: [{ msg: 'Identification incorrecte' }],
      access_token: '',
    }

    beforeAll(async () => {
      if (!response) {
        response = await request
          .post(urn)
          .set('csrf-token', csrf_header)
          .send({
            params: {
              user: '__' + Misc.getRandomStr(20),
              password: 'false_login',
            },
          })
          .then((response) => response.body)
      }
    })

    for (const [key, value] of Object.entries(expected_values)) {
      it(`${key}`, (done) => {
        expect(response[key]).toStrictEqual(value)
        done()
      })
    }
  })

  describe('Login fail with locked account', () => {
    let response,
      affected_rows = 0
    const expected_values = {
      isLock: true,
      isLoggedIn: false,
      isAdmin: false,
      toastMessage: [{ msg: 'Compte verrouillé' }],
      access_token: '',
    }

    beforeAll(async () => {
      if (!response) {
        affected_rows = await Db.merge({
          query: 'UPDATE account SET `is_lock` = 1 WHERE ? LIMIT 1',
          preparedStatement: [{ username: fixtures.username }],
        })

        response = await request
          .post(urn)
          .set('csrf-token', csrf_header)
          .send({
            params: { user: fixtures.username, password: '&_tests_units' },
          })
          .then((response) => response.body)
      }
    })

    it(`Update fixtures`, (done) => {
      expect(affected_rows).toBeGreaterThanOrEqual(1)
      done()
    })

    for (const [key, value] of Object.entries(expected_values)) {
      it(`${key}`, (done) => {
        expect(response[key]).toStrictEqual(value)
        done()
      })
    }
  })

  describe('Login fail for maintenance', () => {
    let response, temp_fixtures
    const expected_values = {
      isLock: false,
      isLoggedIn: false,
      isAdmin: false,
      firstName: 'Tests',
      lastName: 'UNITS',
      toastMessage: [{ msg: 'Application en maintenance' }],
    }

    beforeAll(async () => {
      let select

      // On active le mode maintenance sur l'Api
      await Db.merge({
        query: 'UPDATE settings SET ? LIMIT 1',
        preparedStatement: [{ maintenance: 1 }],
      })
      // On active le mode maintenance sur l'Api

      temp_fixtures = {
        username: '_' + Misc.getRandomStr(15),
        mail: '_' + Misc.getRandomStr(20) + '@units_tests.na',
        password: await Password.hash('&_tests_units'),
        firstname: 'Tests',
        lastname: 'UNITS',
        is_lock: 0,
        jwt_hash: '__tests_units',
      }

      let inserted_row = 0

      select = await Db.get({
        query: 'SELECT id FROM account WHERE username = ? OR mail = ? LIMIT 1',
        preparedStatement: [temp_fixtures.username, temp_fixtures.mail],
      })

      if (!select[0]) {
        inserted_row = await Db.commit({
          query: 'INSERT INTO account SET ?',
          preparedStatement: [temp_fixtures],
        })
      }

      response = await request
        .post(urn)
        .set('csrf-token', csrf_header)
        .send({
          params: { user: temp_fixtures.username, password: '&_tests_units' },
        })
        .then((response) => response.body)
    })

    for (const [key, value] of Object.entries(expected_values)) {
      it(`${key}`, (done) => {
        expect(response[key]).toStrictEqual(value)
        done()
      })
    }
    it(`access_token`, (done) => {
      expect(response.access_token.length).toBeGreaterThanOrEqual(0)
      done()
    })

    afterAll(async () => {
      await Db.delete({
        query: 'DELETE FROM account WHERE ? LIMIT 1',
        preparedStatement: { username: temp_fixtures.username },
      })
    })
  })

  describe('Fixtures', () => {
    it('Delete fixtures', async (done) => {
      // Restaure la table settings au paramètres administrateurs
      await Db.merge({
        query: 'UPDATE settings SET ? LIMIT 1',
        preparedStatement: [settings],
      })
      // Restaure la table settings au paramètres administrateurs

      const row_deleted = await Db.delete({
        query: 'DELETE FROM account WHERE ? LIMIT 1',
        preparedStatement: { username: fixtures.username },
      })
      expect(row_deleted).toBeGreaterThanOrEqual(1)
      done()
    })
  })
})
