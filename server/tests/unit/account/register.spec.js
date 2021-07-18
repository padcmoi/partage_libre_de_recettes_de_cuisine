const dotenv = require('dotenv')
dotenv.config()
const request = require('supertest')('http://127.0.0.1:3000')
const { Db, Password, Form } = require('../../../middleware/index')
const {
  getCsrfToken,
  SettingManager,
  FixtureManager,
  goLogin,
} = require('../_misc/index')

describe('POST /account/register', () => {
  let fixtureManager,
    settingManager,
    sql_request,
    csrf_header,
    origin_settings,
    fixtures,
    login_response,
    access_token,
    params

  beforeAll(async () => {
    fixtureManager = new FixtureManager()
    settingManager = new SettingManager()

    csrf_header = await getCsrfToken(request)

    origin_settings = await settingManager.getOriginData()
    await settingManager.setDefault()

    fixtures = await fixtureManager.generate()

    params = {
      user: fixtures.username,
      password1: '&_tests_units',
      password2: '&_tests_units',
      email1: fixtures.mail,
      email2: fixtures.mail,
      firstname: fixtures.firstname,
      lastname: fixtures.lastname,
      captcha: '',
    }
  })

  it('Login successfull', async (done) => {
    const response = await request
      .post('/account/register')
      .set('csrf-token', csrf_header)
      .send({
        params,
      })
      .then((response) => response.body)

    expect(response.isRegistered).toBeTruthy()
    expect(response.toastMessage.length).toBe(0)
    done()
  })
  it('password bcrypt / comparaison hash', async (done) => {
    sql_request = await Db.get({
      query: 'SELECT * FROM account WHERE username = ? LIMIT 1',
      preparedStatement: [Form.sanitizeString(fixtures.username)],
    })
    const account = sql_request && sql_request[0]

    const isValidPassword = await Password.check(
      params.password1,
      account.password
    )

    expect(isValidPassword).toBeTruthy()
    expect(params.password1).toStrictEqual(params.password2)
    done()
  })
  it('Account failed with username & mail', async (done) => {
    const response = await request
      .post('/account/register')
      .set('csrf-token', csrf_header)
      .send({
        params,
      })
      .then((response) => response.body)

    expect(response.isRegistered).toBeFalsy()
    expect(response.toastMessage.length).toBe(2)
    done()
  })
  it('Account failed for maintenance', async (done) => {
    // On active le mode maintenance sur l'Api
    await Db.merge({
      query: 'UPDATE settings SET ? LIMIT 1',
      preparedStatement: [{ maintenance: 1 }],
    })
    // On active le mode maintenance sur l'Api

    fixtures = await fixtureManager.generate()

    params = {
      user: fixtures.username,
      password1: '&_tests_units',
      password2: '&_tests_units',
      email1: fixtures.mail,
      email2: fixtures.mail,
      firstname: fixtures.firstname,
      lastname: fixtures.lastname,
      captcha: '',
    }

    const response = await request
      .post('/account/register')
      .set('csrf-token', csrf_header)
      .send({
        params,
      })
      .then((response) => response.body)

    await settingManager.setDefault()

    expect(response.isRegistered).toBeFalsy()
    expect(response.toastMessage).toStrictEqual([
      { msg: 'Application en maintenance' },
    ])
    done()
  })

  afterAll(async () => {
    await settingManager.restoreDefault()
  })
})
