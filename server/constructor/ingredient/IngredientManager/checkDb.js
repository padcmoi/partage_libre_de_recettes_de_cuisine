const Db = require('../../../middleware/js/db')

/**
 * @void
 */
module.exports = async function () {
  if (this.isCheck) return
  else this.isCheck = true

  const sql_request = await Db.get({
    query: 'SELECT type FROM `ingredients_type` WHERE ?',
    preparedStatement: [{ type: '-' }],
  })

  if (sql_request.length === 0) {
    await Db.commit({
      query: 'INSERT INTO `ingredients_type` SET ?',
      preparedStatement: [{ type: '-' }],
    })
  }
}
