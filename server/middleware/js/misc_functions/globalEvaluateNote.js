const Db = require('../db')

const isSlugExist = require('./isSlugExist')

/**
 * Modifie le score global de la recette
 * affecte les colonnes liked et disliked
 * en effectuant une recherche en base de données
 *
 * @param {String} slug
 *
 * @returns {Object}
 */
module.exports = async (slug) => {
  let data

  const response = {
    liked: 0,
    disliked: 0,
  }

  if (await isSlugExist(slug)) {
    data = await Db.get({
      query:
        'SELECT note, COUNT(note) AS count FROM `recipes_evaluate` WHERE ? GROUP BY note',
      preparedStatement: [{ slug: slug }],
    })

    for (const d of data) {
      if (typeof d.count != 'number') continue

      if (d.note <= -1) {
        response.disliked += d.count
      } else if (d.note >= 1) {
        response.liked += d.count
      }
    }

    await Db.merge({
      query: 'UPDATE `recipes` SET ? WHERE ? LIMIT 1',
      preparedStatement: [
        { liked: response.liked, disliked: response.disliked },
        { slug },
      ],
    })
  }

  return response
}

// SELECT COUNT(note) AS liked FROM `recipes_evaluate` WHERE note = 1 AND slug = 'pizza-vegetarienne' LIMIT 1
// SELECT note, COUNT(note) AS liked FROM `recipes_evaluate` WHERE slug = 'pizza-vegetarienne' GROUP BY note
// SELECT COUNT(note) AS liked FROM `recipes_evaluate` WHERE note = 1 AND ? LIMIT 1
// SELECT note, COUNT(note) AS liked FROM `recipes_evaluate` WHERE slug = 'pizza-vegetarienne2' AND note = 1 OR note = -1 GROUP BY note
// SELECT liked, disliked FROM `recettes_cuisine`.`recipes` WHERE `slug` = 'pizza-vegetarienne'
