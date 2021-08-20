const Db = require('../../../middleware/js/db')

/**
 * @returns {Boolean/Number}
 */
module.exports = async function () {
  if (!this.access_token || !this.created_by) return false
  else if (!this.ingredient) return false

  if (this.type) await this.typeExist()
  if (this.ingredient) await this.ingredientExist()

  await this.isMine()

  if (this.type && !this.exist.type) return false
  else if (this.ingredient && !this.exist.ingredient) return false
  else if (!this.exist.isMine) return false

  const type = this.type || '',
    ingredient = this.ingredient || '',
    created_by = this.created_by || '',
    data = {}

  if (this.new_type) {
    const sql_request = await Db.get({
      query: 'SELECT `type` FROM `ingredients_type` WHERE ? LIMIT 1',
      preparedStatement: [{ type: this.new_type }],
    })

    if (sql_request && sql_request[0]) data.type = this.new_type || ''
  }
  if (this.new_ingredient) data.ingredient = this.new_ingredient || null
  if (this.picture) data.picture = this.picture || null
  else if (this.picture === null) {
    await Db.merge({
      query: 'UPDATE `ingredients_list` SET picture=NULL WHERE ? AND ? LIMIT 1',
      preparedStatement: [{ ingredient }, { created_by }],
    })
  }

  if (Object.entries(data).length === 0) return 0

  return await Db.merge({
    query: 'UPDATE `ingredients_list` SET ? WHERE ? AND ? AND ? LIMIT 1',
    preparedStatement: [data, { type }, { ingredient }, { created_by }],
  })
}
