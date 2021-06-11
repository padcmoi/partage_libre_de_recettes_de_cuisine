const dotenv = require('dotenv')
dotenv.config()
const request = require('supertest')('http://127.0.0.1:3000')
const { Db } = require('../../../middleware/index')

describe('GET /app/settings', () => {
  let select, settings, response
  const expected_types = {
    maintenance: 'boolean',
    can_create_account: 'boolean',
    user_can_create_recipe: 'boolean',
    user_can_comment: 'boolean',
    user_can_add_ingredient: 'boolean',
    updated_at: 'string',
  }

  beforeAll(async () => {
    response = await request
      .get('/app/settings')
      .then((response) => response.body)

    delete response.execution_time
  })

  describe('typage', () => {
    for (const [key, value] of Object.entries(expected_types)) {
      it(`${key}`, async () => {
        expect(response[key]).toBeDefined()
        expect(typeof response[key]).toBe(value)
      })
    }
  })

  describe('valeur', () => {
    beforeAll(async () => {
      select = await Db.get({
        query: 'SELECT ? FROM settings LIMIT 1',
        preparedStatement: [
          Db.toSqlString(
            '*, DATE_FORMAT(`updated_at`, "%d/%m/%Y %H:%i:%s") AS updated_at'
          ),
        ],
      })

      settings = select && select[0]

      for (const [key, value] of Object.entries(settings)) {
        if (value === 0 || value === 1) {
          settings[key] = settings[key] === 1 || false
        }
      }
    })

    for (const key in expected_types) {
      it(`${key}`, async () => {
        expect(response[key]).toBeDefined()
        expect(response[key]).toBe(settings[key])
      })
    }
  })
})
