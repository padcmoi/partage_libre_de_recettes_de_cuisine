const Db = require('../../../middleware/js/db')

/**
 * @returns {Boolean}
 */
module.exports = async function () {
  if (!this.ingredient) return

  const type = this.type || ''
  const ingredient = this.ingredient

  const sql_request = await Db.get({
    query: 'SELECT `type` FROM `ingredients_list` WHERE ? LIMIT 1',
    preparedStatement: [{ ingredient }],
  })

  if (sql_request && sql_request[0]) {
    this.exist.ingredient = true
    this.exist.ingred_bad_type = sql_request[0].type === type ? false : true
  } else {
    this.exist.ingredient = false
    this.exist.ingred_bad_type = false
  }

  return this.exist.ingredient
}
