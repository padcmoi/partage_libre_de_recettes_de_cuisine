const Db = require('../../../middleware/js/db')

/**
 * @returns {Boolean}
 */
module.exports = async function () {
  if (!this.created_by) return
  else if (!this.type || !this.ingredient) return false

  const type = this.type
  const ingredient = this.ingredient
  const created_by = this.created_by

  const sql_request = await Db.get({
    query:
      'SELECT `created_by` FROM `ingredients_list` WHERE ? AND ? AND ? LIMIT 1',
    preparedStatement: [{ type }, { ingredient }, { created_by }],
  })

  this.exist.isMine = sql_request && sql_request[0] ? true : false

  return this.exist.isMine
}
