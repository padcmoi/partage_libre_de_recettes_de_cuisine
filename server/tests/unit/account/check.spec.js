const dotenv = require('dotenv')
dotenv.config()
const request = require('supertest')('http://127.0.0.1:3000')
const { Db } = require('../../../middleware/index')
const {
  getCsrfToken,
  SettingManager,
  FixtureManager,
  goLogin,
} = require('../_misc/index')

describe('GET /account/check', () => {
  let fixtureManager,
    settingManager,
    sql_request,
    csrf_header,
    origin_settings,
    fixtures,
    login_response,
    access_token

  beforeAll(async () => {
    fixtureManager = new FixtureManager()
    settingManager = new SettingManager()

    csrf_header = await getCsrfToken(request)

    origin_settings = await settingManager.getOriginData()
    await settingManager.setDefault()

    fixtures = await fixtureManager.get()

    login_response = await goLogin(request, fixtures.username, '&_tests_units')

    access_token = login_response.access_token || ''
  })

  it('Test with fake token', async (done) => {
    const expected_values = {
      access_token: null,
      userId: -1,
      isLoggedIn: false,
      isAdmin: false,
      username: null,
      firstname: null,
      lastname: null,
    }

    const response = await request
      .get('/account/check?access_token=fakeToken')
      .then((response) => response.body)

    if (response.execution_time) delete response.execution_time

    expect(response).toStrictEqual(expected_values)
    done()
  })
  it('Use fixtures for login then check return values with true login', async (done) => {
    const response = await request
      .get('/account/check?access_token=' + access_token)
      .then((response) => response.body)

    expect(typeof response.userId).toBe('number')
    expect(response.userId).not.toBe(-1)
    expect(response.isLoggedIn).toBeTruthy()
    expect(response.username).toBe(fixtures.username)
    expect(response.firstname).toBe(fixtures.firstname)
    expect(response.lastname).toBe(fixtures.lastname)
    expect(response.access_token).toBe(access_token)
    done()
  })

  it('Check Values updated then maintenance', async (done) => {
    // On active le mode maintenance sur l'Api
    await Db.merge({
      query: 'UPDATE settings SET ? LIMIT 1',
      preparedStatement: [{ maintenance: 1 }],
    })
    // On active le mode maintenance sur l'Api

    const response = await request
      .get('/account/check?access_token=' + access_token)
      .then((response) => response.body)

    await settingManager.setDefault()

    expect(typeof response.userId).toBe('number')
    expect(response.userId).not.toBe(-1)
    expect(response.isLoggedIn).toBeFalsy() // en maintenance isLoggedIn dévient false sauf si admin
    expect(response.username).toBe(fixtures.username)
    expect(response.firstname).toBe(fixtures.firstname)
    expect(response.lastname).toBe(fixtures.lastname)
    expect(response.access_token).toBe(access_token)
    done()
  })

  afterAll(async () => {
    await settingManager.restoreDefault()
  })
})
