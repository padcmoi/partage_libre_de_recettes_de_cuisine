const Db = require('../db')

/**
 * Vérifie si une évaluation existe et retourne le score actuel
 *
 * @param {String} slug
 * @param {String} created_by
 *
 * @returns {Object}
 */
module.exports = async (slug, created_by) => {
  let currentNote = 0,
    noteExist = false

  if (typeof slug === 'string' && typeof created_by === 'string') {
    // Verifie si l'évaluation existe
    const data = await Db.get({
      query: 'SELECT `note` FROM `recipes_evaluate` WHERE ? AND ? LIMIT 1',
      preparedStatement: [{ slug }, { created_by }],
    })

    noteExist = data && data[0] ? true : false

    if (noteExist) {
      currentNote = data && data[0].note
    }
  }

  return { noteExist, currentNote }
}
