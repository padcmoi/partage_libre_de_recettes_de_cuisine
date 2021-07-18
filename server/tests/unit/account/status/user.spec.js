const dotenv = require('dotenv')
dotenv.config()
const request = require('supertest')('http://127.0.0.1:3000')
const { Misc, Db } = require('../../../../middleware/index')
const {
  getCsrfToken,
  SettingManager,
  FixtureManager,
  goLogin,
} = require('../../_misc/index')

describe('GET /account/status/user/:user', () => {
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

  it('Username busy on fixtures', async (done) => {
    const response = await request
      .get('/account/status/user/' + fixtures.username)
      .set('csrf-token', csrf_header)
      .then((response) => response.body)

    expect(response.isAvailable).toBeFalsy()
    expect(response.isLocked).toBeDefined()
    expect(response.isLocked).toBeFalsy()
    done()
  })
  it('Username free', async (done) => {
    const username_free = '_' + Misc.getRandomStr(25) + '@units_tests.na'

    const response = await request
      .get('/account/status/user/' + username_free)
      .set('csrf-token', csrf_header)
      .then((response) => response.body)

    expect(response.isAvailable).toBeTruthy()
    expect(response.isLocked).toBeUndefined()
    done()
  })
  it('is maintenance isAvailable always true', async (done) => {
    // On active le mode maintenance sur l'Api
    await Db.merge({
      query: 'UPDATE settings SET ? LIMIT 1',
      preparedStatement: [{ maintenance: 1 }],
    })
    // On active le mode maintenance sur l'Api

    const response = await request
      .get('/account/status/user/' + fixtures.username)
      .set('csrf-token', csrf_header)
      .then((response) => response.body)

    await settingManager.setDefault()

    expect(response.isAvailable).toBeTruthy() // en maintenance isAvailable est toujours true
    done()
  })

  afterAll(async () => {
    await settingManager.restoreDefault()
  })
})
