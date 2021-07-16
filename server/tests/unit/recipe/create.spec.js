const dotenv = require('dotenv')
dotenv.config()
const request = require('supertest')('http://127.0.0.1:3000')
const { Misc, Db, Password, Form } = require('../../../middleware/index')
const { RecipeManager } = require('../../../constructor/index')
const {
  getCsrfToken,
  SettingManager,
  FixtureManager,
  Recipe,
  goLogin,
} = require('../_misc/index')

describe('POST /recipe', () => {
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

  it("Création d'une recette", async (done) => {
    await recipe.add()

    const response = recipe.getResponse()
    delete response.execution_time

    expect(response.success).toBeTruthy()
    expect(response.failProcess).toStrictEqual([])
    expect(response.slug).toBeDefined()
    expect(response.title).toBeDefined()
    expect(response.toastMessage.length).toBe(1)
    done()
  })
  it('Slug comparaison Api / Function', async (done) => {
    const data = recipe.getData()
    const response = recipe.getResponse()
    delete response.execution_time

    Form.sanitizeEachData(data, ['seasons'])

    const required = [
      'slugTitle',
      'description',
      'seasons',
      'difficulty',
      'nutriscore',
      'cookingTime',
      'preparationTime',
      'category',
    ]

    const recipeManager = new RecipeManager(data, required)
    const processData = await recipeManager.result()

    expect(response.slug).toStrictEqual(processData.dataProcessed.slug)
    done()
  })
  it('Le titre de la recette existe déja', async (done) => {
    await recipe.add() // On recrée une recette avec le meme titre

    const response = recipe.getResponse()
    delete response.execution_time

    expect(response.success).toBeFalsy() // Si la recette existe elle doit etre refusé par l'Api
    expect(response.failProcess).toStrictEqual(['slugTitle'])
    expect(response.toastMessage.length).toBe(1)
    done()
  })
  it('Tentative avec un formulaire erroné', async (done) => {
    await recipe.makeData()

    recipe.params.description = 123
    recipe.params.seasons = 'error'
    recipe.params.difficulty = ['NotArray']
    recipe.params.nutriscore = ['NotArray']
    recipe.params.preparation_time = '300'
    recipe.params.cooking_time = -1
    recipe.params.category = 'Categorie n existe pas'

    await recipe.add() // On recrée une recette avec le meme titre

    const response = recipe.getResponse()
    delete response.execution_time

    const expected_failProcess = [
      'description',
      'seasons',
      'difficulty',
      'nutriscore',
      'cookingTime',
      'preparationTime',
      'category',
    ]

    expect(response.success).toBeFalsy() // Le formulaire contient des erreurs
    expect(response.failProcess).toStrictEqual(expected_failProcess)
    expect(response.toastMessage.length).toBe(6)
    done()
  })

  afterAll(async () => {
    await settingManager.restoreDefault()
    await fixtureManager.removeFixtures()
  })
})
