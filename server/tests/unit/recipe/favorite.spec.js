const dotenv = require('dotenv')
dotenv.config()
const request = require('supertest')('http://127.0.0.1:3000')
const { Misc, Db, Password } = require('../../../middleware/index')
const {
  getCsrfToken,
  SettingManager,
  FixtureManager,
  Recipe,
  goLogin,
} = require('../_misc/index')

describe('POST /recipe/favorite/:slug', () => {
  let fixtureManager,
    settingManager,
    sql_request,
    csrf_header,
    origin_settings,
    fixtures,
    login_response,
    access_token,
    recipe

  beforeAll(async () => {
    fixtureManager = new FixtureManager()
    settingManager = new SettingManager()

    csrf_header = await getCsrfToken(request)

    origin_settings = await settingManager.getOriginData()

    await settingManager.setDefault()

    fixtures = await fixtureManager.getFixtures()

    login_response = await goLogin(request, fixtures.username, '&_tests_units')

    access_token = login_response.access_token || ''

    recipe = new Recipe(request, access_token)
    await recipe.add()
  })

  it('Check login', (done) => {
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

    for (const key in check) expect(typeof login_response[key]).toBe(check[key])
    done()
  })

  it('Ajout ! Recette ajoutée à vos favoris', async (done) => {
    const slug = recipe.getResponse().slug || ''

    const response = await request
      .post(`/recipe/favorite/${slug}?access_token=${access_token} `)
      .set('csrf-token', csrf_header)
      .send()
      .then((response) => response.body)

    delete response.execution_time

    const expected_values = {
      success: true,
      toastMessage: [{ type: 'success', msg: 'Recette ajoutée à vos favoris' }],
    }

    expect(response).toStrictEqual(expected_values)
    done()
  })
  it('Ajout ! Cette recette est déja dans vos favoris', async (done) => {
    const slug = recipe.getResponse().slug || ''

    const response = await request
      .post(`/recipe/favorite/${slug}?access_token=${access_token} `)
      .set('csrf-token', csrf_header)
      .send()
      .then((response) => response.body)

    delete response.execution_time

    const expected_values = {
      success: false,
      toastMessage: [
        { type: 'warning', msg: 'Cette recette est déja dans vos favoris' },
      ],
    }

    expect(response).toStrictEqual(expected_values)
    done()
  })

  it('Suppression ! Recette supprimée de vos favoris', async (done) => {
    const slug = recipe.getResponse().slug || ''

    const response = await request
      .delete(`/recipe/favorite/${slug}?access_token=${access_token} `)
      .set('csrf-token', csrf_header)
      .send()
      .then((response) => response.body)

    delete response.execution_time

    const expected_values = {
      success: true,
      toastMessage: [
        { type: 'success', msg: 'Recette supprimée de vos favoris' },
      ],
    }

    expect(response).toStrictEqual(expected_values)
    done()
  })

  it("Suppression ! Cette recette n'est pas dans vos favoris", async (done) => {
    const slug = recipe.getResponse().slug || ''

    const response = await request
      .delete(`/recipe/favorite/${slug}?access_token=${access_token} `)
      .set('csrf-token', csrf_header)
      .send()
      .then((response) => response.body)

    delete response.execution_time

    const expected_values = {
      success: false,
      toastMessage: [
        { type: 'warning', msg: "Cette recette n'est pas dans vos favoris" },
      ],
    }

    expect(response).toStrictEqual(expected_values)
    done()
  })

  afterAll(async () => {
    await settingManager.restoreDefault()
    await fixtureManager.removeFixtures()
  })
})
