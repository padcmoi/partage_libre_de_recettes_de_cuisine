const Db = require('../../../middleware/js/db')

/**
 * @returns {Boolean}
 */
module.exports = async function () {
  if (!this.id_ingredients || !this.slug) return

  const id_ingredients = this.id_ingredients
  const slug = this.slug

  const sql_request = await Db.get({
    query: 'SELECT `ingredient` FROM `ingredients` WHERE ? AND ? LIMIT 1',
    preparedStatement: [{ id_ingredients }, { slug }],
  })

  this.exist.ingredient = sql_request && sql_request[0] ? true : false

  return this.exist.ingredient
}
