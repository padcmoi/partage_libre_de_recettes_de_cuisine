const { Db, Bootstrap, Settings, Jwt, Misc } = require('../../middleware/index')
const { RecipeManager, MultipleData } = require('../../constructor/index')

module.exports = async function (_req) {
  let query = _req.query

  const accountFromToken = await Jwt.myInformation(query['access_token'] || '')
  const myUsername =
    accountFromToken && accountFromToken.username
      ? accountFromToken.username
      : ''

  const maintenance = await Settings.maintenance()

  const toastMessage = []
  let response = { toastMessage },
    req,
    hide_without_pictures

  if (!maintenance) {
    const allowed_orderBy = [
      'created_at',
      'title',
      'total_time',
      'cooking_time',
      'preparation_time',
      'season_winter',
      'season_autumn',
      'season_summer',
      'season_spring',
      'liked',
      'disliked',
    ]
    const allowed_where = ['title']

    const _bootstrapTable = Bootstrap.table(
      query,
      allowed_orderBy,
      allowed_where
    )
    const tableData = await _bootstrapTable.get()
    const filter = await _bootstrapTable.where(false)

    const state = tableData.state,
      offset = tableData.offset

    // Cache les recettes sans images
    if (parseInt(query.hide_without_pictures)) {
      hide_without_pictures = ' count_pictures IS NOT NULL '
      state.hide_without_pictures = true
    } else {
      hide_without_pictures = ''
      state.hide_without_pictures = false
    }

    let operator_where_1 = hide_without_pictures != '' ? 'AND' : ''
    let operator_where_2 = filter != '' ? 'AND' : ''

    req = await Db.get({
      query:
        'SELECT ? ' +
        'FROM recipes AS r ' +
        'LEFT JOIN count_pictures AS cp ON(r.slug = cp.slug ) ' +
        Misc.customSqlRules.addPictures().leftJoin.join(' ') +
        'LEFT JOIN who_is_owner AS wio ON(r.created_by = wio.username ) ' +
        'LEFT JOIN has_favorite AS hf ON(? = hf.created_by AND r.slug = hf.slug ) ' +
        'WHERE is_lock = 0 ' +
        Misc.customSqlRules.showByFoodsTypes(query, true, false) +
        'AND season_winter LIKE ? AND season_autumn LIKE ? AND season_summer LIKE ? AND season_spring LIKE ? ' +
        `${operator_where_1} ${hide_without_pictures} ${operator_where_2} ${filter} ${tableData.orderBy} ${tableData.limit}`,
      preparedStatement: [
        Db.toSqlString(
          'hf.has_favorite, ' +
            'r.locked_comment, r.slug, r.title, ' +
            'DATE_FORMAT(`created_at`, "%d/%m/%Y %H:%i:%s") AS created_at, ' +
            'wio.firstname, wio.lastname, ' +
            'r.preparation_time, r.cooking_time, ' +
            'r.preparation_time + r.cooking_time AS total_time, ' +
            'r.season_winter, r.season_autumn, r.season_summer, r.season_spring, ' +
            'r.liked, r.disliked, ' +
            Misc.customSqlRules.addPictures().prepStat.join(',') +
            ',' +
            'cp.count_pictures '
        ),
        myUsername,
        parseInt(query.winter) || '%',
        parseInt(query.autumn) || '%',
        parseInt(query.summer) || '%',
        parseInt(query.spring) || '%',
      ],
    })
    const data = req || []

    RecipeManager.picturesReorder(data)

    // On rend un minimum l'anonymat dans les noms de famille
    for (const d of data) {
      RecipeManager.sanitizeRead(d)
      const multipleData = new MultipleData(d)
      await multipleData.recipesFoodTypes(d.slug)
    }

    const currentRows = req && req.length

    req = await Db.get({
      query:
        'SELECT COUNT(*) AS totalRows FROM recipes AS r ' +
        'WHERE is_lock = 0 ' +
        Misc.customSqlRules.showByFoodsTypes(query, true, false) +
        'AND season_winter LIKE ? AND season_autumn LIKE ? AND season_summer LIKE ? AND season_spring LIKE ? ' +
        `${operator_where_1} ${hide_without_pictures} ${operator_where_2} ${filter} LIMIT 1`,
      preparedStatement: [
        parseInt(query.winter) || '%',
        parseInt(query.autumn) || '%',
        parseInt(query.summer) || '%',
        parseInt(query.spring) || '%',
      ],
    })

    const totalRows = req && req[0].totalRows

    const pageNumber = Math.ceil(totalRows / offset)

    const table = { currentRows, totalRows, pageNumber, state }

    response = Object.assign({ data }, { table }, { toastMessage })
  } else if (maintenance) {
    // Maintenance
    toastMessage.push({ msg: 'Application en maintenance' })
  }

  return response
}
