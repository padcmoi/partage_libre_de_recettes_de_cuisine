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

describe('POST /account/login', () => {
  let fixtureManager, settingManager, csrf_header, origin_settings, fixtures

  beforeAll(async () => {
    fixtureManager = new FixtureManager()
    settingManager = new SettingManager()

    csrf_header = await getCsrfToken(request)

    origin_settings = await settingManager.getOriginData()
    await settingManager.setDefault()
  })

  it('Login successfull', async (done) => {
    fixtures = await fixtureManager.get()

    const response = await goLogin(request, fixtures.username, '&_tests_units')

    const check = {
      isLock: 'boolean',
      isLoggedIn: 'boolean',
      isAdmin: 'boolean',
      firstName: 'string',
      lastName: 'string',
      toastMessage: 'object',
      access_token: 'string',
      execution_time: 'object',
    }

    for (const key in check) expect(typeof response[key]).toBe(check[key])
    expect(response.isLock).toBeFalsy()
    expect(response.isLoggedIn).toBeTruthy()
    done()
  })
  it('Login fail with locked account', async (done) => {
    fixtureManager.fixtures = null
    fixtures = await fixtureManager.get()

    await Db.merge({
      query: 'UPDATE `account` SET `is_lock` = 1 WHERE ? LIMIT 1',
      preparedStatement: [{ username: fixtures.username }],
    })

    const response = await goLogin(request, fixtures.username, '&_tests_units')

    expect(response.isLock).toBeTruthy()
    expect(response.isLoggedIn).toBeFalsy()
    expect(response.toastMessage.length).toBe(1)
    expect(response.access_token).toBe('')
    done()
  })
  it('Login fail for maintenance', async (done) => {
    fixtureManager.fixtures = null
    fixtures = await fixtureManager.get()

    // On active le mode maintenance sur l'Api
    await Db.merge({
      query: 'UPDATE settings SET ? LIMIT 1',
      preparedStatement: [{ maintenance: 1 }],
    })
    // On active le mode maintenance sur l'Api

    const response = await goLogin(request, fixtures.username, '&_tests_units')

    await settingManager.setDefault()

    expect(response.isLock).toBeFalsy()
    expect(response.isLoggedIn).toBeFalsy()
    expect(response.firstName).toBe(fixtures.firstname)
    expect(response.lastName).toBe(fixtures.lastname)
    expect(response.toastMessage.length).toBe(1)
    expect(response.access_token).toBe('')
    done()
  })

  afterAll(async () => {
    await settingManager.restoreDefault()
  })
})
