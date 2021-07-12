const Misc = require('../../middleware/js/misc')
const Db = require('../../middleware/js/db')
const Bootstrap = require('../../middleware/js/bootstrap')

module.exports = class MultipleData {
  constructor(response) {
    this.response = response
  }

  /**
   * @PUBLIC
   * Charge categories
   *
   * @returns {Array}
   */
  async categories() {
    const categories = []
    let req = await Db.get({
      query: 'SELECT category FROM `categories`',
    })

    for (const d of req) {
      categories.push(d.category)
    }

    return Object.assign(this.response, { categories })
  }

  /**
   * @PUBLIC
   * Charge foods_types_list
   *
   * @returns {Array}
   */
  async foodTypesList() {
    const foodTypesList = []
    let req = await Db.get({
      query: 'SELECT food FROM `foods_types_list`',
    })

    for (const d of req) {
      foodTypesList.push(d.food)
    }

    return Object.assign(this.response, { foodTypesList })
  }

  /**
   * @PUBLIC
   * Charge ingredients_list
   *
   * @returns {Array}
   */
  async ingredientsList() {
    let ingredientsList = await Db.get({
      query: 'SELECT type, ingredient, picture FROM `ingredients_list`',
    })

    return Object.assign(this.response, { ingredientsList })
  }

  /**
   * @PUBLIC
   * Charge ingredients_type
   *
   * @returns {Array}
   */
  async ingredientsType() {
    let ingredientsType = await Db.get({
      query: 'SELECT type, picture FROM `ingredients_type`',
    })

    return Object.assign(this.response, { ingredientsType })
  }

  /**
   * @PUBLIC
   * Charge ingredients_type
   *
   * @param {Object} query
   * @param {String} slug
   * @returns {Array}
   */
  async recipesComments(query = {}, slug = undefined) {
    const _bootstrapTable = Bootstrap.table(query, [], [])
    const tableData = await _bootstrapTable.get()
    let req

    const table = await Db.get({
      query:
        'SELECT ? ' +
        'FROM `recipes_comments` AS r ' +
        'LEFT JOIN who_is_owner AS wio ON(r.created_by = wio.username ) ' +
        `WHERE slug LIKE ? AND comment LIKE ?` +
        'ORDER BY `created_at` DESC ' +
        `${tableData.limit}`,

      preparedStatement: [
        Db.toSqlString(
          'r.comment, r.created_by, ' +
            'DATE_FORMAT(`created_at`, "%d/%m/%Y %H:%i:%s") AS created_at, ' +
            'DATE_FORMAT(`updated_at`, "%d/%m/%Y %H:%i:%s") AS updated_at, ' +
            'wio.firstname, wio.lastname '
        ),
        slug || '%',
        tableData.filter,
      ],
    })

    const currentRows = table.length

    // On rend un minimum l'anonymat dans les noms de famille
    for (const d of table) {
      d.lastname = Misc.truncate(d.lastname, 1)
      d.lastname += '.'
    }

    req = await Db.get({
      query:
        'SELECT COUNT(*) AS totalRows FROM `recipes_comments` WHERE slug LIKE ? LIMIT 1',
      preparedStatement: [slug || '%'],
    })

    const totalRows = req && req[0].totalRows

    const comments = {
      table,
      currentRows,
      totalRows,
      state: tableData.state,
    }

    return Object.assign(this.response, { comments })
  }

  /**
   * @PUBLIC
   * Charge les instructions de la recette
   *
   * @param {String} slug
   * @returns {Array}
   */
  async recipesInstructions(slug) {
    let recipesInstructions = await Db.get({
      query:
        'SELECT num_step, instruction FROM `recipes_instructions` WHERE slug = ? ORDER BY num_step ASC',
      preparedStatement: [slug],
    })

    return Object.assign(this.response, { recipesInstructions })
  }

  /**
   * @PUBLIC
   * Charge les unités de mesure
   *
   * @returns {Array}
   */
  async unitsList() {
    let unitsList = await Db.get({
      query: 'SELECT unit, type FROM `units_list`',
    })

    return Object.assign(this.response, { unitsList })
  }
}
