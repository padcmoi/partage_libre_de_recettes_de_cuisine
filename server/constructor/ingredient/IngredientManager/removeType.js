const Misc = require('../../../middleware/js/misc')
const Db = require('../../../middleware/js/db')

/**
 * @returns {Boolean}
 */
module.exports = async function () {
  if (!this.type || !this.access_token) return false

  this.exist.is_admin = await Misc.isAdmin(this.access_token)
  await this.typeExist()

  if (!this.exist.type) return false

  const type = this.type

  const count_ingredient_use = await Db.get({
    query: 'SELECT count(type) AS count FROM `ingredients` WHERE ?',
    preparedStatement: [{ type }],
  })

  const count_ingredient_list = await Db.get({
    query: 'SELECT count(type) AS count FROM `ingredients_list` WHERE ?',
    preparedStatement: [{ type }],
  })

  this.exist.count_ingredient_use = parseInt(count_ingredient_use[0].count)
  this.exist.count_ingredient_list = parseInt(count_ingredient_list[0].count)

  if (this.exist.count_ingredient_use > 0) return false
  if (this.exist.count_ingredient_list > 0 && !this.force) return false

  await Db.delete({
    query: 'DELETE FROM `ingredients_type` WHERE ? LIMIT 1',
    preparedStatement: [{ type }],
  })

  return true
}
