const Db = require('../../../middleware/js/db')

/**
 * @returns {Boolean/Number}
 */
module.exports = async function () {
  if (!this.slug || !this.quantity || !this.type) return false
  else if (!this.ingredient || !this.unit) return false
  else if (!this.access_token) return false

  await this.typeExist()
  await this.ingredientExist()
  await this.unitExist()

  if (!this.exist.type) return false
  else if (!this.exist.ingredient) return false
  else if (!this.exist.unit) return false
  else if (this.exist.ingred_bad_type) return false

  const slug = this.slug,
    quantity = this.quantity,
    type = this.type,
    ingredient = this.ingredient,
    unit = this.unit

  return await Db.commit({
    query: 'INSERT INTO `ingredients` SET ?',
    preparedStatement: [{ quantity, slug, type, ingredient, unit }],
  })
}
