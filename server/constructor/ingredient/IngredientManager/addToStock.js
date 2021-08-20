const Db = require('../../../middleware/js/db')

/**
 * @returns {Boolean}
 */
module.exports = async function () {
  if (!this.type || typeof this.picture === 'undefined') return false
  else if (!this.ingredient || !this.created_by) return false
  else if (!this.access_token) return false

  await this.typeExist()
  await this.ingredientExist()

  if (!this.exist.type) return false
  else if (this.exist.ingredient) return false
  else if (this.exist.ingred_bad_type) return false

  const type = this.type,
    ingredient = this.ingredient,
    picture = this.picture,
    created_by = this.created_by

  await Db.commit({
    query: 'INSERT INTO `ingredients_list` SET ?',
    preparedStatement: [{ type, ingredient, picture, created_by }],
  })

  return true
}
