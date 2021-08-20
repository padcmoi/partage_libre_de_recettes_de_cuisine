const Db = require('../../../middleware/js/db')

/**
 * @returns {Boolean}
 */
module.exports = async function () {
  if (!this.id_ingredients || !this.slug) return false
  else if (!this.access_token) return false

  const id_ingredients = this.id_ingredients
  const slug = this.slug

  await this.recipeIngredientExist()

  if (!this.exist.ingredient) return false

  return await Db.delete({
    query: 'DELETE FROM `ingredients` WHERE ? AND ? LIMIT 1',
    preparedStatement: [{ id_ingredients }, { slug }],
  })
}
