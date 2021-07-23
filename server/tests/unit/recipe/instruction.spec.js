const dotenv = require('dotenv')
dotenv.config()
const request = require('supertest')('http://127.0.0.1:3000')
const {} = require('../../../middleware/index')
const {
  getCsrfToken,
  SettingManager,
  FixtureManager,
  Recipe,
  goLogin,
  RecipeInstruction,
} = require('../_misc/index')

describe('POST /instruction/:slug/:position', () => {
  let csrf_header,
    settingManager,
    origin_settings,
    fixtureManager,
    fixtures,
    login_response,
    access_token,
    recipeInstruction,
    recipe,
    slug

  beforeAll(async () => {
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

    recipe = new Recipe(request, access_token)
    await recipe.add()
    slug = recipe.getResponse().slug || ''
  })
  it('Fixtures ! 5 Instructions ajoutées', async (done) => {
    const params = {
      picture: null,
    }
    const countRecipeAdded = []

    for (let position = 0; position < 5; position++) {
      params.instruction = 'message_step_' + position

      const response = await recipeInstruction.add(slug, position, params)

      if (response && response.success) countRecipeAdded.push(response)
    }

    expect(countRecipeAdded.length).toBe(5)
    done()
  })

  describe('POST /instruction/:slug/:position', () => {
    it('Ajout ! Instruction ajoutée en position 2 & réorganise la liste', async (done) => {
      const params = {
        instruction: 'Mettre du sel',
        picture: null,
      }

      const response = await recipeInstruction.add(slug, 2, params)

      const recipesInstructions = [
        { num_step: 0, instruction: 'message_step_0' },
        { num_step: 1, instruction: 'message_step_1' },
        { num_step: 2, instruction: 'Mettre du sel' },
        { num_step: 3, instruction: 'message_step_2' },
        { num_step: 4, instruction: 'message_step_3' },
        { num_step: 5, instruction: 'message_step_4' },
      ]

      expect(response.success).toBeTruthy()
      expect(response.instructionById).toBeGreaterThanOrEqual(0)
      expect(response.toastMessage.length).toBe(1)

      for (let i = 0; i < recipesInstructions.length; i++) {
        const api = response.recipesInstructions[i]
        expect(api.picture).toBeNull()
        delete api.id_instructions
        delete api.picture
        expect(api).toStrictEqual(recipesInstructions[i])
      }
      done()
    })
  })
  describe('PUT /instruction/:slug/:position', () => {
    it("Modif ! Instruction modifiée en position 2 & décale l'ancienne instruction si besoin", async (done) => {
      const params = {
        instruction: 'Mettre du poivre',
        picture: null,
      }

      const response = await recipeInstruction.change(slug, 2, params)

      const recipesInstructions = [
        { num_step: 0, instruction: 'message_step_0' },
        { num_step: 1, instruction: 'message_step_1' },
        { num_step: 2, instruction: 'Mettre du poivre' },
        { num_step: 3, instruction: 'message_step_2' },
        { num_step: 4, instruction: 'message_step_3' },
        { num_step: 5, instruction: 'message_step_4' },
      ]

      expect(response.success).toBeTruthy()
      expect(response.toastMessage.length).toBe(1)

      for (let i = 0; i < recipesInstructions.length; i++) {
        const api = response.recipesInstructions[i]
        expect(api.picture).toBeNull()
        delete api.id_instructions
        delete api.picture
        expect(api).toStrictEqual(recipesInstructions[i])
      }
      done()
    })
  })
  describe('PUT /instruction/:slug/position/:old/:new', () => {
    it('Modif ! Instruction en position 2 devient position 0 & réorganise la liste', async (done) => {
      const response = await recipeInstruction.move(slug, 2, 0)

      // console.log(response)

      const recipesInstructions = [
        { num_step: 0, instruction: 'Mettre du poivre' },
        { num_step: 1, instruction: 'message_step_0' },
        { num_step: 2, instruction: 'message_step_1' },
        { num_step: 3, instruction: 'message_step_2' },
        { num_step: 4, instruction: 'message_step_3' },
        { num_step: 5, instruction: 'message_step_4' },
      ]

      expect(response.success).toBeTruthy()

      for (let i = 0; i < recipesInstructions.length; i++) {
        const api = response.recipesInstructions[i]
        delete api.id_instructions
        delete api.picture
        expect(api).toStrictEqual(recipesInstructions[i])
      }
      done()
    })
  })

  describe('DELETE /instruction/:slug/:position', () => {
    it('Suppression ! Instruction supprimée en position 0 & réorganise la liste', async (done) => {
      const response = await recipeInstruction.remove(slug, 2)

      const recipesInstructions = [
        { num_step: 0, instruction: 'message_step_0' },
        { num_step: 1, instruction: 'message_step_1' },
        { num_step: 2, instruction: 'message_step_2' },
        { num_step: 3, instruction: 'message_step_3' },
        { num_step: 4, instruction: 'message_step_4' },
      ]

      expect(response.success).toBeTruthy()
      expect(response.toastMessage.length).toBe(1)

      for (let i = 0; i < recipesInstructions.length; i++) {
        const api = response.recipesInstructions[i]
        expect(api.picture).toBeNull()
        delete api.id_instructions
        delete api.picture
        expect(api).toStrictEqual(recipesInstructions[i])
      }
      done()
    })
  })

  afterAll(async () => {
    await settingManager.restoreDefault()
  })
})
