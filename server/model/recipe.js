const Db = require('../middleware/js/db')

/**
 * Creer toutes les Vues SQL nécessaires à l'Api
 */
const createSqlVues = function () {
  const MAX_PICTURES = parseInt(process.env.MAX_PICTURES) || 7
  const required = [
    `CREATE OR REPLACE VIEW count_pictures AS SELECT slug, COUNT(*) AS count_pictures FROM recipes_pictures GROUP BY slug`,
    `CREATE OR REPLACE VIEW who_is_owner AS SELECT username, firstname, lastname FROM account GROUP BY username`,
    `CREATE OR REPLACE VIEW has_favorite AS SELECT slug, created_by, 1 AS has_favorite FROM recipes_favorite GROUP BY id_favorite`,
  ]
  for (let i = 0; i < MAX_PICTURES; i++) {
    required.push(
      `CREATE OR REPLACE VIEW show_picture_num${i} AS SELECT slug, picture AS show_picture_num${i} FROM recipes_pictures WHERE num_step = ${i}`
    )
  }
  for (const request of required) Db.query(request)
}
createSqlVues()

module.exports = {
  change: require('./recipe/change'),
  create: require('./recipe/create'),
  delete: require('./recipe/delete'),
  favorite: require('./recipe/favorite'),
  list: require('./recipe/list'),
  misc: require('./recipe/misc'),
  view: require('./recipe/view'),
  note: require('./recipe/note'),
  comment: require('./recipe/comment'),
}
