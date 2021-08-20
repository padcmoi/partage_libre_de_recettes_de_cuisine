const Misc = require('../../../middleware/js/misc')
const Db = require('../../../middleware/js/db')

/**
 * @returns {Boolean}
 */
module.exports = async function () {
  if (!this.type) return false
  else if (!this.access_token) return false

  this.exist.is_admin = await Misc.isAdmin(this.access_token)

  if (this.new_type) {
    const sql_request = await Db.get({
      query: 'SELECT type FROM `ingredients_type` WHERE ? LIMIT 1',
      preparedStatement: [{ type: this.new_type }],
    })

    if (sql_request && sql_request[0]) {
      this.exist.new_type = true
      return false
    }
  }

  await this.typeExist()

  if (!this.exist.type) return false

  const data = {}

  if (this.new_type) data.type = this.new_type || ''
  if (this.picture) data.picture = this.picture || null

  if (Object.entries(data).length === 0) return 0

  return await Db.merge({
    query: 'UPDATE `ingredients_type` SET ? WHERE ? LIMIT 1',
    preparedStatement: [data, { type: this.type }],
  })
}
