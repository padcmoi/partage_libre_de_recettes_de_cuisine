const Db = require('../../../middleware/js/db')

/**
 * @returns {Boolean}
 */
module.exports = async function () {
  if (!this.type || !this.ingredient) return false
  else if (!this.created_by) return false

  const type = this.type
  const ingredient = this.ingredient
  const created_by = this.created_by

  await this.isMine()
  await this.ingredientExist()

  if (!this.exist.isMine) return false
  else if (!this.exist.ingredient) return false
  else if (this.exist.ingred_bad_type) return false

  return await Db.delete({
    query: 'DELETE FROM `ingredients_list` WHERE ? AND ? AND ? LIMIT 1',
    preparedStatement: [{ type }, { ingredient }, { created_by }],
  })
}
