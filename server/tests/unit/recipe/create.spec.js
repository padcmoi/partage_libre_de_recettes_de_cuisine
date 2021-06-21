const dotenv = require('dotenv')
dotenv.config()
const request = require('supertest')('http://127.0.0.1:3000')
const { Misc, Db, Password } = require('../../../middleware/index')
const { randomArray, randomStr } = require('../_misc/index')

describe('POST /recipe', () => {
  let csrf_header, fixtures, settings, response, access_token, categories

  beforeAll(async () => {
    csrf_header = await request
      .get('/csrf/generate')
      .then((response) => response.body.csrf_token)
    if (!csrf_header) csrf_header = ''

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

    select = await Db.get({
      query: 'SELECT id FROM account WHERE username = ? OR mail = ? LIMIT 1',
      preparedStatement: [fixtures.username, fixtures.mail],
    })

    if (!select[0]) {
      await Db.commit({
        query: 'INSERT INTO account SET ?',
        preparedStatement: [fixtures],
      })
    }

    // Recupère toutes les categories
    categories = []
    select = await Db.get({
      query: 'SELECT category FROM categories',
    })
    for (const obj of select) {
      if (!obj.category) continue

      categories.push(obj.category)
    }
    // Recupère toutes les categories
  })

  it('Login', async (done) => {
    if (!response) {
      response = await request
        .post('/account/login')
        .set('csrf-token', csrf_header)
        .send({
          params: { user: fixtures.username, password: '&_tests_units' },
        })
        .then((response) => response.body)

      access_token = response.access_token || ''
      expect(response.isLoggedIn).toBeTruthy()
    }
    done()
  })

  describe('fully authenticated', () => {
    let params,
      title = randomStr(52)

    beforeEach(async () => {
      params = {
        title,
        description: randomStr(60),
        seasons: randomArray(['Winter', 'Autumn', 'Summer', 'Spring']),
        difficulty: randomArray(['EaSy', 'MeDIuM', 'hArD'], 1).join(),
        nutriscore: randomArray(['a', 'B', 'C', 'd', 'e'], 1).join(),
        preparation_time: Misc.getRandomInt(180, 600),
        cooking_time: Misc.getRandomInt(300, 600),
        category: randomArray(categories, 1).join(),
      }
    })

    it('Recipe successfully created with overfilled form', async (done) => {
      response = await request
        .post('/recipe?access_token=' + access_token)
        .set('csrf-token', csrf_header)
        .send({
          params,
        })
        .then((response) => response.body)

      expect(response.success).toBeTruthy()
      expect(response.failProcess.length).toBe(0)
      expect(response.toastMessage[0].type).toBe('success')

      done()
    })
    it('Recipe successfully created with overfilled form', async (done) => {
      params.title = randomStr(52)

      response = await request
        .post('/recipe?access_token=' + access_token)
        .set('csrf-token', csrf_header)
        .send({
          params,
        })
        .then((response) => response.body)

      expect(response.success).toBeTruthy()
      expect(response.failProcess.length).toBe(0)
      expect(response.toastMessage[0].type).toBe('success')

      done()
    })
    it('Failed to create recipe with wrong complete form ', async (done) => {
      params.description = 123
      params.seasons = 'error'
      params.difficulty = ['NotArray']
      params.nutriscore = ['NotArray']
      params.preparation_time = '300'
      params.cooking_time = -1
      params.category = 'Categorie n existe pas'

      response = await request
        .post('/recipe?access_token=' + access_token)
        .set('csrf-token', csrf_header)
        .send({
          params,
        })
        .then((response) => response.body)

      expect(response.success).toBeFalsy()
      const failProcess = [
        'slugTitle',
        'description',
        'seasons',
        'difficulty',
        'nutriscore',
        'cookingTime',
        'preparationTime',
        'category',
      ]
      for (let i = 0; i < failProcess.length; i++) {
        expect(response.failProcess[i]).toBe(failProcess[i])
      }
      expect(response.toastMessage.length).toBe(7)

      done()
    })
  })

  describe('not authenticated', () => {
    let params,
      access_token = 'fake token'

    beforeAll(async () => {
      params = {
        title: randomStr(52),
        description: randomStr(60),
        seasons: randomArray(['Winter', 'Autumn', 'Summer', 'Spring']),
        difficulty: randomArray(['EaSy', 'MeDIuM', 'hArD'], 1).join(),
        nutriscore: randomArray(['a', 'B', 'C', 'd', 'e'], 1).join(),
        preparation_time: Misc.getRandomInt(180, 600),
        cooking_time: Misc.getRandomInt(300, 600),
        category: randomArray(categories, 1).join(),
      }
    })

    it('Recipe send with overfilled form', async (done) => {
      response = await request
        .post('/recipe?access_token=' + access_token)
        .set('csrf-token', csrf_header)
        .send({
          params,
        })
        .then((response) => response.body)

      expect(response.success).toBeFalsy()
      expect(response.toastMessage[0].type).toBe('error')

      done()
    })
  })

  afterAll(async () => {
    // Restaure la table settings au paramètres administrateurs
    await Db.merge({
      query: 'UPDATE settings SET ? LIMIT 1',
      preparedStatement: [settings],
    })
    // Restaure la table settings au paramètres administrateurs

    await Db.delete({
      query: 'DELETE FROM account WHERE ? LIMIT 1',
      preparedStatement: { username: fixtures.username },
    })

    // Restaure l'auto incrémentation
    await Db.merge({
      query: 'ALTER TABLE `account` auto_increment = 1;',
    })
    // Restaure l'auto incrémentation
  })
})
