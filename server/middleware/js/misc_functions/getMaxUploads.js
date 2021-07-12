const Db = require('../db')

/**
 * Retourne la limite d'upload d'un compte utilisateur
 * La limite max sera définie par l'Api MAX_PICTURES
 *
 * @returns {Number}
 */
module.exports = async (username) => {
  const MAX_PICTURES = parseInt(process.env.MAX_PICTURES) || 7

  const data = await Db.get({
    query: 'SELECT `max_uploads` FROM `account` WHERE `username` = ? LIMIT 1',
    preparedStatement: [username],
  })

  let max_uploads = data && data[0] ? parseInt(data[0].max_uploads || 7) : 7

  if (max_uploads > MAX_PICTURES) {
    max_uploads = MAX_PICTURES
  }

  return max_uploads
}
