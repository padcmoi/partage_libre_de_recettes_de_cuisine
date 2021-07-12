const { Db, Settings, Jwt, Misc } = require('../../middleware/index')
const {
  RecipeManager,
  MultipleData,
  ReorganizeData,
} = require('../../constructor/index')

module.exports = async function (query, slug) {
  const accountFromToken = await Jwt.myInformation(query['access_token'] || '')
  const myUsername =
    accountFromToken && accountFromToken.username
      ? accountFromToken.username
      : ''

  const maintenance = await Settings.maintenance()
  const user_can_comment = await Settings.user_can_comment()

  // const table = await Bootstrap.table(query)

  const toastMessage = []
  let response = { success: false, toastMessage, user_can_comment },
    req

  if (!maintenance) {
    req = await Db.get({
      query:
        'SELECT ? ' +
        'FROM recipes AS r ' +
        'LEFT JOIN count_pictures AS cp ON(r.slug = cp.slug ) ' +
        Misc.customSqlRules().leftJoin.join(' ') +
        'LEFT JOIN who_is_owner AS wio ON(r.created_by = wio.username ) ' +
        'LEFT JOIN has_favorite AS hf ON(? = hf.created_by AND r.slug = hf.slug ) ' +
        'WHERE is_lock = 0 AND r.slug = ? ',
      preparedStatement: [
        Db.toSqlString(
          'r.*, r.preparation_time + r.cooking_time AS total_time, ' +
            'DATE_FORMAT(`created_at`, "%d/%m/%Y %H:%i:%s") AS created_at, ' +
            'DATE_FORMAT(`updated_at`, "%d/%m/%Y %H:%i:%s") AS updated_at, ' +
            Misc.customSqlRules().prepStat.join(',') +
            ',' +
            'wio.firstname, wio.lastname, ' +
            'hf.has_favorite, ' +
            'cp.count_pictures '
        ),
        myUsername,
        slug,
      ],
    })

    // SELECT r.*, r.preparation_time + r.cooking_time AS total_time, DATE_FORMAT(`created_at`, "%d/%m/%Y %H:%i:%s") AS created_at, DATE_FORMAT(`updated_at`, "%d/%m/%Y %H:%i:%s") AS updated_at, sp1.show_picture_num1, sp2.show_picture_num2, sp3.show_picture_num3, wio.firstname, wio.lastname, hf.has_favorite, cp.count_pictures  FROM recipes AS r LEFT JOIN count_pictures AS cp ON(r.slug = cp.slug ) LEFT JOIN show_picture_num1 AS sp1 ON(r.slug = sp1.slug ) LEFT JOIN show_picture_num2 AS sp2 ON(r.slug = sp2.slug ) LEFT JOIN show_picture_num3 AS sp3 ON(r.slug = sp3.slug ) LEFT JOIN who_is_owner AS wio ON(r.created_by = wio.username ) LEFT JOIN has_favorite AS hf ON('' = hf.created_by AND r.slug = hf.slug ) WHERE is_lock = 0 AND r.slug = 'pizza-vegetarienne'

    // CREATE OR REPLACE VIEW has_favorite AS SELECT slug, created_by, COUNT(*) AS has_favorite FROM recipes_favorite

    const data = (req && req[0]) || null

    if (data) {
      RecipeManager.picturesReorder([data])
      RecipeManager.sanitizeRead(data)

      response.success = true

      Object.assign(response, data)

      const multipleData = new MultipleData(response)
      await multipleData.recipesComments(query, slug)
      await multipleData.recipesInstructions('pizza-orientale')

      response = ReorganizeData.view(response)
    } else {
      toastMessage.push({
        type: 'error',
        msg: "Cette recette n'est plus accessible ou a été supprimé !",
      })
    }

    response = Object.assign(response, { toastMessage })
  } else if (maintenance) {
    // Maintenance
    toastMessage.push({ msg: 'Application en maintenance' })
  }

  return response
}
