const Db = require('../db')

/**
 * Retourne en objet si la recette appartient à un utilisateur
 * Si la réponse est oui,
 * alors il retournera l'id du commentaire
 *
 * @param {Number} id_comment
 * @param {String} slug
 * @param {String} created_by
 *
 * @returns {Object}
 */
module.exports = async (id_comment, slug, created_by) => {
  const result = {
    isMine: false,
    id_comment: -1,
  }

  if (typeof id_comment === 'number' && created_by && slug) {
    const data = await Db.get({
      query:
        'SELECT `id_comment` FROM `recipes_comments` WHERE ? AND ? AND ? LIMIT 1',
      preparedStatement: [{ id_comment }, { slug }, { created_by }],
    })

    result.isMine = data && data[0] ? true : false
    if (result.isMine) {
      result.id_comment = data && data[0].id_comment
    }
  }

  return result
}
