const Db = require('../db')

/**
 * Vérifie si le slug existe sur une recette
 *
 * @param {String} slug
 *
 * @returns {Boolean}
 */
module.exports = async (slug) => {
  const data = await Db.get({
    query: 'SELECT `slug` FROM `recipes` WHERE `slug` = ? LIMIT 1',
    preparedStatement: [slug],
  })

  return data && data[0] ? true : false
}
