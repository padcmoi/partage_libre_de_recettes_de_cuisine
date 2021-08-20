const Db = require('../db')
const Bootstrap = require('../bootstrap')
const Jwt = require('../jwt')

module.exports = {
  /**
   * Par colonne type
   *
   * @param {Object} query
   *
   * @returns {Object}
   */
  async byType(query) {
    let ingredients,
      sql_request,
      type = query.type || ''

    const response = { success: false, toastMessage: [], ingredients: [] }

    const allowed_orderBy = [
        'type',
        'ingredient',
        'picture',
        'created_by',
        'created_at',
        'updated_at',
      ],
      allowed_where = []
    const _bootstrapTable = Bootstrap.table(
      query,
      allowed_orderBy,
      allowed_where
    )

    const tableData = await _bootstrapTable.get(),
      state = tableData.state,
      offset = tableData.offset,
      orderBy = tableData.orderBy,
      limit = tableData.limit

    ingredients = await Db.get({
      query: 'SELECT ? FROM `ingredients_list` WHERE ?' + orderBy + limit,
      preparedStatement: [
        Db.toSqlString(
          'type,ingredient,picture,' +
            'DATE_FORMAT(`created_at`, "%d/%m/%Y %H:%i:%s") AS created_at, ' +
            'DATE_FORMAT(`updated_at`, "%d/%m/%Y %H:%i:%s") AS updated_at '
        ),
        { type },
      ],
    })
    response.ingredients = ingredients

    const currentRows = ingredients && ingredients.length

    sql_request = await Db.get({
      query:
        'SELECT COUNT(*) AS totalRows FROM ingredients_list WHERE ? LIMIT 1',
      preparedStatement: [{ type }],
    })
    const totalRows = sql_request && sql_request[0].totalRows

    const pageNumber = Math.ceil(totalRows / offset)

    response.table = { currentRows, totalRows, pageNumber, state }

    if (Array.isArray(response.ingredients)) {
      if (response.ingredients.length > 0) {
        response.success = true
      }
    }

    return response
  },

  /**
   * Par colonne created_by
   *
   * @param {Object} query
   *
   * @returns {Object}
   */
  async byAccount(query) {
    let ingredients,
      sql_request,
      access_token = query['access_token'] || ''

    const accountFromToken = await Jwt.myInformation(access_token)

    const response = { success: false, toastMessage: [], ingredients: [] }

    if (accountFromToken && accountFromToken.username) {
      const allowed_orderBy = [
          'type',
          'ingredient',
          'picture',
          'created_by',
          'created_at',
          'updated_at',
        ],
        allowed_where = []
      const _bootstrapTable = Bootstrap.table(
        query,
        allowed_orderBy,
        allowed_where
      )

      const tableData = await _bootstrapTable.get(),
        state = tableData.state,
        offset = tableData.offset,
        orderBy = tableData.orderBy,
        limit = tableData.limit

      const created_by = accountFromToken.username

      ingredients = await Db.get({
        query: 'SELECT ? FROM `ingredients_list` WHERE ?' + orderBy + limit,
        preparedStatement: [
          Db.toSqlString(
            'type,ingredient,picture,' +
              'DATE_FORMAT(`created_at`, "%d/%m/%Y %H:%i:%s") AS created_at, ' +
              'DATE_FORMAT(`updated_at`, "%d/%m/%Y %H:%i:%s") AS updated_at '
          ),
          { created_by },
        ],
      })
      const currentRows = ingredients && ingredients.length

      sql_request = await Db.get({
        query:
          'SELECT COUNT(*) AS totalRows FROM ingredients_list WHERE ? LIMIT 1',
        preparedStatement: [{ created_by }],
      })
      const totalRows = sql_request && sql_request[0].totalRows

      const pageNumber = Math.ceil(totalRows / offset)

      response.success = true
      response.ingredients = ingredients
      response.table = { currentRows, totalRows, pageNumber, state }
    }

    return response
  },
}
