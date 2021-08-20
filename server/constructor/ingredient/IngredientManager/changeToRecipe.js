const Db = require('../../../middleware/js/db')

/**
 * @returns {Boolean/Number}
 */
module.exports = async function () {
  if (!this.slug || !this.id_ingredients || !this.access_token) return false
  else if (!this.ingredient || !this.type) return false

  await this.typeExist()
  await this.ingredientExist()
  if (this.unit) await this.unitExist()

  if (!this.exist.type) return false
  else if (!this.exist.ingredient) return false
  else if (this.exist.ingred_bad_type) return false
  else if (this.unit && !this.exist.unit) return false

  const slug = this.slug || '',
    id_ingredients = parseInt(this.id_ingredients) || '',
    data = {},
    check = {
      quantity: 'number',
      type: 'string',
      ingredient: 'string',
      unit: 'string',
    }
  for (const key in check) {
    if (typeof this[key] !== check[key]) continue
    data[key] = this[key]
  }

  return await Db.merge({
    query: 'UPDATE `ingredients` SET ? WHERE ? AND ? LIMIT 1',
    preparedStatement: [data, { id_ingredients }, { slug }],
  })
}
