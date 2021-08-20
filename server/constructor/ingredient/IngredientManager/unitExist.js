const Db = require('../../../middleware/js/db')

/**
 * @returns {Boolean}
 */
module.exports = async function () {
  if (!this.unit) return

  const unit = this.unit

  const sql_request = await Db.get({
    query: 'SELECT `unit` FROM `units_list` WHERE ? LIMIT 1',
    preparedStatement: [{ unit }],
  })

  this.exist.unit = sql_request && sql_request[0] ? true : false

  return this.exist.unit
}
