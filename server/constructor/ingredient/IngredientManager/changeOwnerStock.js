const Db = require('../../../middleware/js/db')

/**
 * @returns {Boolean/Number}
 */
module.exports = async function () {
  if (!this.access_token || !this.created_by) return false
  else if (!this.type || !this.ingredient) return false

  await this.ingredientExist()
  await this.isMine()

  if (!this.exist.ingredient) return false
  else if (this.exist.ingred_bad_type) return false
  else if (!this.exist.isMine) return false

  const type = this.type || '',
    ingredient = this.ingredient || '',
    created_by = this.created_by || ''

  return await Db.merge({
    query: 'UPDATE `ingredients_list` SET ? WHERE ? AND ? AND ? LIMIT 1',
    preparedStatement: [
      Db.toSqlString('created_by=NULL'),
      { type },
      { ingredient },
      { created_by },
    ],
  })
}
