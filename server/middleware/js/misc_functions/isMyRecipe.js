const Db = require('../db')

/**
 * Retourne en objet si la recette appartient à un utilisateur
 * Si la réponse est oui,
 * alors il retournera le slug et le titre de la recette
 *
 * @param {String} created_by
 * @param {String} slug
 *
 * @returns {Object}
 */
module.exports = async (created_by, slug) => {
  const result = {
    isMine: false,
    currentRecipe: {},
  }

  if (typeof created_by === 'string' && typeof slug === 'string') {
    const data = await Db.get({
      query: 'SELECT `slug`,`title` FROM `recipes` WHERE ? AND ? LIMIT 1',
      preparedStatement: [{ created_by }, { slug }],
    })

    result.isMine = data && data[0] ? true : false
    result.currentRecipe = (data && data[0]) || {}
  }

  return result
}
