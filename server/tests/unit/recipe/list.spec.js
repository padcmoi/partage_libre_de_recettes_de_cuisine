const dotenv = require('dotenv')
dotenv.config()
const request = require('supertest')('http://127.0.0.1:3000')
const {} = require('../../../middleware/index')
const {
  getCsrfToken,
  SettingManager,
  FixtureManager,
  Recipe,
  RecipeFoodsTypes,
  goLogin,
} = require('../_misc/index')

describe('GET /recipe', () => {
  let csrf_header,
    settingManager,
    origin_settings,
    fixtureManager,
    recipeFoodsTypes,
    fixtures,
    login_response,
    access_token,
    slugs,
    titles

  beforeAll(async () => {
    slugs = []
    titles = []
    csrf_header = await getCsrfToken(request)

    settingManager = new SettingManager()
    origin_settings = await settingManager.getOriginData()
    await settingManager.setDefault()

    fixtureManager = new FixtureManager()
    fixtures = await fixtureManager.get()

    login_response = await goLogin(request, fixtures.username, '&_tests_units')
    access_token = login_response.access_token || ''

    recipeFoodsTypes = new RecipeFoodsTypes()

    for (let idx = 0; idx < 25; idx++) {
      const recipe = new Recipe(request, access_token)
      await recipe.add()
    }
  })

  it('Fixtures ! foods types ajoutés + 5 Recettes ajoutées', async (done) => {
    for (let idx = 0; idx < 5; idx++) {
      await recipeFoodsTypes.add()
    }

    for (let idx = 0; idx < 5; idx++) {
      const recipe = new Recipe(request, access_token)
      await recipe.add()
      const _slug = recipe.getResponse().slug || ''
      const _title = recipe.getData().title || ''
      slugs.push(_slug)
      titles.push(_title)

      for (let i = 0; i < recipeFoodsTypes.food_list.length; i++) {
        await recipeFoodsTypes.use(_slug, recipeFoodsTypes.food_list[i])
      }
    }

    done()
  })

  it('Show data without filter, without sorting', async (done) => {
    const response = await request
      .get('/recipe?currentPage=3&perPage=11&sortBy=created_at&sortDesc=false')
      .then((response) => response.body)

    expect(response.data.length).toBeGreaterThanOrEqual(8)
    expect(response.table.currentRows).toBeGreaterThanOrEqual(8)
    expect(response.table.pageNumber).toBeGreaterThanOrEqual(3)
    expect(response.table.state.sorter).toBeTruthy()
    expect(response.table.state.limit).toBeTruthy()
    expect(response.table.state.filter).toBeFalsy()
    expect(response.table.state.hide_without_pictures).toBeFalsy()
    done()
  })

  it('Search data by filter with at least 1 result', async (done) => {
    const response = await request
      .get('/recipe?where=title,description&filter=' + titles[0])
      .then((response) => response.body)

    let hasSlug = false
    for (let i = 0; i < response.data.length; i++) {
      if (response.data[i].slug === slugs[0]) hasSlug = true
    }

    expect(hasSlug).toBeTruthy()
    expect(response.table.currentRows).toBeGreaterThanOrEqual(1)
    expect(response.table.totalRows).toBeGreaterThanOrEqual(1)
    expect(response.table.pageNumber).toBeGreaterThanOrEqual(1)
    expect(response.table.state.sorter).toBeFalsy()
    expect(response.table.state.limit).toBeTruthy()
    expect(response.table.state.filter).toBeTruthy()
    expect(response.table.state.hide_without_pictures).toBeFalsy()
    done()
  })

  it('Show 6 data starting with the 6th result and sorting by created date in descending order', async (done) => {
    const response = await request
      .get('/recipe?currentPage=3&perPage=11&sortBy=created_at&sortDesc=false')
      .then((response) => response.body)

    expect(response.data.length).toBeGreaterThanOrEqual(8)
    expect(response.table.currentRows).toBeGreaterThanOrEqual(8)
    expect(response.table.pageNumber).toBeGreaterThanOrEqual(3)
    expect(response.table.state.sorter).toBeTruthy()
    expect(response.table.state.limit).toBeTruthy()
    expect(response.table.state.filter).toBeFalsy()
    expect(response.table.state.hide_without_pictures).toBeFalsy()
    done()
  })

  it('Search data by foods types', async (done) => {
    const response = await request
      .get('/recipe?foodType=' + recipeFoodsTypes.food_list.join())
      .then((response) => response.body)

    for (let i = 0; i < response.data.length; i++) {
      const res = response.data[i]
      expect(res.recipes_food_types).toStrictEqual(recipeFoodsTypes.food_list)
    }
    expect(response.table && response.table.currentRows).toBe(5)
    done()
  })

  afterAll(async () => {
    await settingManager.restoreDefault()
    await recipeFoodsTypes.removeAll()
  })
})
