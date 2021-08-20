const Db = require('../../../middleware/js/db')

/**
 * @returns {Boolean}
 */
module.exports = async function () {
  if (!this.type) return

  const type = this.type

  const sql_request = await Db.get({
    query: 'SELECT `type` FROM `ingredients_type` WHERE ? LIMIT 1',
    preparedStatement: [{ type }],
  })

  this.exist.type = sql_request && sql_request[0] ? true : false

  return this.exist.type
}
