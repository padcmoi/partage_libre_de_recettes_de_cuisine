const Db = require('./db')
const dotenv = require('dotenv')
dotenv.config()

const db = {
  async load() {
    const select = await Db.get({
      query: 'SELECT ? FROM settings',
      preparedStatement: [
        Db.toSqlString(
          '*, DATE_FORMAT(`updated_at`, "%d/%m/%Y %H:%i:%s") AS updated_at'
        ),
      ],
    })

    return select && select[0]
  },
}

module.exports = {
  async all() {
    const data = await db.load()

    return data
  },
  async maintenance() {
    const data = await db.load()

    return data.maintenance === 1 || false
  },
  async can_create_account() {
    const data = await db.load()

    return data.can_create_account === 1 || false
  },
  async user_can_create_recipe() {
    const data = await db.load()

    return data.user_can_create_recipe === 1 || false
  },
  async user_can_comment() {
    const data = await db.load()

    return data.user_can_comment === 1 || false
  },
  async user_can_add_ingredient() {
    const data = await db.load()

    return data.user_can_add_ingredient === 1 || false
  },
  async updated_at() {
    const data = await db.load()

    return data.updated_at
  },
}
