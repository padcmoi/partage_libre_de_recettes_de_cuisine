const dotenv = require('dotenv')
dotenv.config()
const request = require('supertest')('http://127.0.0.1:3000')
const {} = require('../../../middleware/index')
const {
  getCsrfToken,
  SettingManager,
  FixtureManager,
  Recipe,
  RecipeInstruction,
  RecipeFoodsTypes,
  RecipeIngredients,
  goLogin,
} = require('../_misc/index')

describe('GET /recipe/:slug', () => {
  let csrf_header,
    settingManager,
    origin_settings,
    fixtureManager,
    recipeInstruction,
    recipeFoodsTypes,
    recipeIngredients,
    fixtures,
    login_response,
    access_token,
    slug,
    title,
    recipeAdded

  beforeAll(async () => {
    recipeAdded = []

    csrf_header = await getCsrfToken(request)

    settingManager = new SettingManager()
    origin_settings = await settingManager.getOriginData()
    await settingManager.setDefault()

    fixtureManager = new FixtureManager()
    fixtures = await fixtureManager.get()

    login_response = await goLogin(request, fixtures.username, '&_tests_units')
    access_token = login_response.access_token || ''

    recipeInstruction = new RecipeInstruction(request, csrf_header)
    recipeInstruction.token = access_token

    recipeFoodsTypes = new RecipeFoodsTypes()

    recipeIngredients = new RecipeIngredients(request, csrf_header)
    recipeIngredients.token = access_token

    recipeIngredients.add("L'ail à Gous'dour - Pk pas", '-', null)
    recipeIngredients.use('pizza-vegetarienne', 'oeuf', 2, 'pincée')
  })

  describe('Fixtures', () => {
    it('1 recette ajoutée', async (done) => {
      const recipe = new Recipe(request, access_token)
      await recipe.add()
      slug = recipe.getResponse().slug || ''
      title = recipe.getData().title || ''
      done()
    })
    it('5 Foods Types ajoutés', async (done) => {
      for (let idx = 0; idx < 5; idx++) {
        await recipeFoodsTypes.add()
      }

      for (let i = 0; i < recipeFoodsTypes.food_list.length; i++) {
        await recipeFoodsTypes.use(slug, recipeFoodsTypes.food_list[i])
      }

      done()
    })

    it('5 Instructions ajoutées', async (done) => {
      const params = {
        picture: null,
      }

      for (let position = 0; position < 5; position++) {
        params.instruction = 'message_step_' + position

        const response = await recipeInstruction.add(slug, position, params)

        if (response && response.success) recipeAdded.push(response)
      }

      expect(recipeAdded.length).toBe(5)
      done()
    })
  })

  describe('Check Response', () => {
    let res

    beforeAll(async () => {
      res = await request
        .get('/recipe/' + slug)
        .then((response) => response.body)
    })

    it('Structure exist', async (done) => {
      const entries = Object.fromEntries([
        ['success', 'boolean'],
        ['toastMessage', 'object'],
        ['user_can_comment', 'boolean'],
        ['locked_comment', 'boolean'],
        ['has_favorite', 'boolean'],
        ['slug', 'string'],
        ['title', 'string'],
        ['description', 'string'],
        ['created_at', 'string'],
        ['updated_at', 'string'],
        ['created_by', 'string'],
        ['firstname', 'string'],
        ['lastname', 'string'],
        ['difficulty', 'string'],
        ['nutriscore', 'string'],
        ['preparation_time', 'number'],
        ['cooking_time', 'number'],
        ['total_time', 'number'],
        ['liked', 'number'],
        ['disliked', 'number'],
        ['category', 'string'],
        ['count_pictures', 'number'],
        ['pictures', 'object'],
        ['seasons', 'object'],
      ])

      for (const [key, value] of Object.entries(entries)) {
        expect(res[key]).toBeDefined()
        expect(typeof res[key]).toBe(value)
      }

      done()
    })

    it('Foods Types ajoutés', async (done) => {
      expect(res.recipes_food_types).toStrictEqual(recipeFoodsTypes.food_list)
      done()
    })
    it('Instructions ajoutées', async (done) => {
      expect(res.recipesInstructions.length).toBe(5)
      done()
    })
    it('Structure commentaire', async (done) => {
      expect(res.comments).toStrictEqual({
        table: [],
        currentRows: 0,
        pageNumber: 0,
        totalRows: 0,
        state: { sorter: false, limit: true, filter: false },
      })
      done()
    })
  })

  afterAll(async () => {
    await settingManager.restoreDefault()
    await recipeFoodsTypes.removeAll()
  })
})
