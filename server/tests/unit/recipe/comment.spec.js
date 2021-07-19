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
  doubleAccount,
} = require('../_misc/index')

describe('/comment/:slug', () => {
  let fixtureManager,
    settingManager,
    csrf_header,
    origin_settings,
    fixtures,
    login_response,
    access_token,
    recipe,
    params,
    commentById,
    second_account,
    slug

  beforeAll(async () => {
    params = { comment: 'Commentaire test' }

    fixtureManager = new FixtureManager()
    settingManager = new SettingManager()

    csrf_header = await getCsrfToken(request)

    origin_settings = await settingManager.getOriginData()

    await settingManager.setDefault()

    fixtures = await fixtureManager.get()

    login_response = await goLogin(request, fixtures.username, '&_tests_units')

    access_token = login_response.access_token || ''

    recipe = new Recipe(request, access_token)
    await recipe.add()

    slug = recipe.getResponse().slug || ''

    // Second compte pour tester les droits
    second_account = await doubleAccount(request)
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

  describe('POST /comment/:slug', () => {
    it('Ajout ! Commentaire', async (done) => {
      const response = await request
        .post(`/recipe/comment/${slug}?access_token=${access_token} `)
        .set('csrf-token', csrf_header)
        .send({ params })
        .then((response) => response.body)

      commentById = response.commentById

      expect(response.commentById).toBeGreaterThanOrEqual(0)
      expect(response.success).toBeTruthy()
      expect(response.toastMessage).toStrictEqual([
        { type: 'success', msg: 'Votre commentaire a été ajouté' },
      ])
      done()
    })
    it('Ajout ! Tentative avec faux jeton', async (done) => {
      const response = await request
        .post(`/recipe/comment/${slug}?access_token=fake`)
        .set('csrf-token', csrf_header)
        .send({ params })
        .then((response) => response.body)
      expect(response.success).toBeFalsy()
      expect(response.toastMessage).toStrictEqual([
        { type: 'error', msg: "Vous n'êtes pas correctement identifié" },
      ])
      done()
    })
  })

  describe('PUT /comment/:slug/:id', () => {
    it('Modification ! Commentaire', async (done) => {
      const params = { comment: 'Commentaire modifié' }

      const response = await request
        .put(
          `/recipe/comment/${slug}/${commentById}?access_token=${access_token} `
        )
        .set('csrf-token', csrf_header)
        .send({ params })
        .then((response) => response.body)

      delete response.execution_time

      const expected_values = {
        success: true,
        toastMessage: [
          { type: 'success', msg: 'Votre commentaire a été modifié' },
        ],
      }

      expect(response).toStrictEqual(expected_values)
      done()
    })
    it('Modification ! Test de proprieté sur un commentaire', async (done) => {
      const params = { comment: 'Commentaire problème de droits' }

      const response = await request
        .put(
          `/recipe/comment/${slug}/${commentById}?access_token=${second_account.access_token} `
        )
        .set('csrf-token', csrf_header)
        .send({ params })
        .then((response) => response.body)
      delete response.execution_time

      const expected_values = {
        success: false,
        toastMessage: [
          {
            type: 'error',
            msg: "Ce commentaire ne vous appartient pas ou n'existe pas",
          },
        ],
      }
      expect(response).toStrictEqual(expected_values)
      done()
    })
  })

  describe('DELETE /comment/:slug/:id', () => {
    it('Suppression ! Commentaire', async (done) => {
      const response = await request
        .delete(
          `/recipe/comment/${slug}/${commentById}?access_token=${access_token} `
        )
        .set('csrf-token', csrf_header)
        .send()
        .then((response) => response.body)
      delete response.execution_time

      const expected_values = {
        success: true,
        toastMessage: [
          { type: 'success', msg: 'Votre commentaire a été supprimé' },
        ],
      }
      expect(response).toStrictEqual(expected_values)
      done()
    })
    it('Modification ! Tentative avec faux jeton', async (done) => {
      const response = await request
        .delete(`/recipe/comment/${slug}/${commentById}?access_token=fake`)
        .set('csrf-token', csrf_header)
        .send()
        .then((response) => response.body)
      expect(response.success).toBeFalsy()
      expect(response.toastMessage).toStrictEqual([
        { type: 'error', msg: "Vous n'êtes pas correctement identifié" },
      ])
      done()
    })
  })

  describe('PUT /comment/:slug/:id', () => {
    it('Modification ! Commentaire inéxistant', async (done) => {
      const params = {
        comment: 'Ce commentaire n est pas censé etre dans la base de données',
      }

      const response = await request
        .put(
          `/recipe/comment/${slug}/${commentById}?access_token=${access_token} `
        )
        .set('csrf-token', csrf_header)
        .send({ params })
        .then((response) => response.body)

      delete response.execution_time

      const expected_values = {
        success: false,
        toastMessage: [
          {
            type: 'error',
            msg: "Ce commentaire ne vous appartient pas ou n'existe pas",
          },
        ],
      }

      expect(response).toStrictEqual(expected_values)
      done()
    })

    it('Modification ! Tentative avec faux jeton', async (done) => {
      const response = await request
        .put(`/recipe/comment/${slug}/${commentById}?access_token=fake`)
        .set('csrf-token', csrf_header)
        .send({ params })
        .then((response) => response.body)
      expect(response.success).toBeFalsy()
      expect(response.toastMessage).toStrictEqual([
        { type: 'error', msg: "Vous n'êtes pas correctement identifié" },
      ])
      done()
    })
  })

  afterAll(async () => {
    await settingManager.restoreDefault()
  })
})
