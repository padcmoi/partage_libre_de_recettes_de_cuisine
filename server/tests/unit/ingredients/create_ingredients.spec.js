const dotenv = require('dotenv')
dotenv.config()
const request = require('supertest')('http://127.0.0.1:3000')
const { Form } = require('../../../middleware/index')
const { RecipeManager } = require('../../../constructor/index')
const {
  getCsrfToken,
  SettingManager,
  FixtureManager,
  Recipe,
  goLogin,
  RequestApi,
} = require('../_misc/index')
const { response } = require('express')

require('../purge.spec')

describe('POST /ingredient', () => {
  let fixtureManager,
    settingManager,
    requestApi,
    csrf_header,
    origin_settings,
    fixtures,
    login_response,
    access_token,
    recipe,
    slug,
    last_insertid

  beforeAll(async () => {
    csrf_header = await getCsrfToken(request)

    settingManager = new SettingManager()
    origin_settings = await settingManager.getOriginData()
    await settingManager.setDefault()

    fixtureManager = new FixtureManager()
    fixtures = await fixtureManager.get()
    login_response = await goLogin(request, fixtures.username, '&_tests_units')
    access_token = login_response.access_token || ''

    recipe = new Recipe(request, access_token)
    await recipe.add()

    requestApi = new RequestApi(request, csrf_header)
  })

  it('Recette crée', async (done) => {
    const response = recipe.getResponse()
    slug = response.slug
    expect(response.success).toBeTruthy()
    done()
  })

  describe("type d'aliment", () => {
    const params = {
      type: '___TEST_UNITAIRES___',
      picture: '___TEST_UNITAIRES___',
    }
    it('Autorisation requise (admin)', async (done) => {
      const response = await requestApi.post(
        `/ingredient/type?access_token=${access_token}`,
        params
      )

      expect(response.success).toBeFalsy()
      done()
    })
    it('Ajouté', async (done) => {
      await fixtureManager.setAdmin()

      const response = await requestApi.post(
        `/ingredient/type?access_token=${access_token}`,
        params
      )

      await fixtureManager.removeAdmin()

      expect(response.success).toBeTruthy()
      done()
    })
  })

  it('Ajout ingredient au stock', async (done) => {
    const params = {
      type: '___TEST_UNITAIRES___',
      ingredient: '___TEST_UNITAIRES___',
    }

    let response

    for (let i = 0; i < 8; i++) {
      response = await requestApi.post(
        `/ingredient/stock?access_token=${access_token}`,
        params
      )

      params.ingredient = '___TEST_UNITAIRES___' + i
      params.picture = '___TEST_UNITAIRES___' + i
    }

    await requestApi.post(
      `/ingredient/stock?access_token=${access_token}`,
      params
    )

    params.type = '-'

    expect(response.success).toBeTruthy()
    done()
  })
  it("Utilise l'ingredient avec un type défini", async (done) => {
    const params = {
      type: '___TEST_UNITAIRES___',
      ingredient: '___TEST_UNITAIRES___',
      quantity: 1,
      unit: 'ml',
    }

    const response = await requestApi.post(
      `/ingredient/recipe/${slug}?access_token=${access_token}`,
      params
    )

    last_insertid = parseInt(response.id_ingredients)

    expect(response.success).toBeTruthy()
    done()
  })
  it("Modifie l'ingredient", async (done) => {
    const params = {
      type: '___TEST_UNITAIRES___',
      ingredient: '___TEST_UNITAIRES___2',
      quantity: 120,
      unit: 'g',
    }

    const response = await requestApi.put(
      `/ingredient/recipe/${slug}/${last_insertid}?access_token=${access_token}`,
      params
    )

    expect(response.success).toBeTruthy()
    done()
  })
  it('Modifie le stock', async (done) => {
    let params = {
      type: '___TEST_UNITAIRES___',
      ingredient: '___TEST_UNITAIRES___2',
      new_ingredient: '___TEST_UNITAIRES___ABC_<SCRIPT>alert(123);</SCRIPT>',
      new_type: '-',
      picture: null,
    }

    const response = await requestApi.put(
      `/ingredient/stock?access_token=${access_token}`,
      params
    )

    expect(response.success).toBeTruthy()
    done()
  })
  it('Transfert de propriété', async (done) => {
    const response = await requestApi.put(
      `/ingredient/owner/stock?access_token=${access_token}`,
      (params = {
        type: '___TEST_UNITAIRES___',
        ingredient: '___TEST_UNITAIRES___7',
      })
    )

    expect(response.success).toBeTruthy()
    done()
  })
  it('Modifie le type', async (done) => {
    await fixtureManager.setAdmin()

    const response = await requestApi.put(
      `/ingredient/type?access_token=${access_token}`,
      (params = {
        type: '___TEST_UNITAIRES___',
        new_type: '___TEST_UNITAIRES___2',
        picture: null,
      })
    )

    await fixtureManager.removeAdmin()

    expect(response.success).toBeTruthy()
    done()
  })

  it("Retire l'ingredient d'une recette", async (done) => {
    const response = await requestApi.delete(
      `/ingredient/recipe/${slug}/${last_insertid}?access_token=${access_token}`
    )

    await fixtureManager.removeAdmin()

    expect(response.success).toBeTruthy()
    done()
  })

  it('Suppression le type', async (done) => {
    await fixtureManager.setAdmin()

    const response = await requestApi.delete(
      `/ingredient/type?access_token=${access_token}`,
      (params = {
        type: '___TEST_UNITAIRES___2',
        force: true,
      })
    )
    expect(response.success).toBeTruthy()

    await fixtureManager.removeAdmin()

    done()
  })
  it('Suppression du stock', async (done) => {
    const params = {
      type: '-',
      ingredient: '___TEST_UNITAIRES___ABC_<SCRIPT>alert(123);</SCRIPT>',
    }

    const response = await requestApi.delete(
      `/ingredient/stock?access_token=${access_token}`,
      params
    )
    expect(response.success).toBeTruthy()

    done()
  })

  afterAll(async () => {
    await settingManager.restoreDefault()
  })
})
