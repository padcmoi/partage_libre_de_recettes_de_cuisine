const { Db } = require('../../middleware/index')
const { isFileExistsSync } = require('is-file-exists')

const UPLOAD_FOLDER = process.env.UPLOAD_FOLDER || 'files_uploads'

const noPictureFile = process.env.RECIPE_NO_PICTURE_FILE || 'no_picture.png'

/**
 * NOTE: J'ai fait le choix de ne pas hasher le slug ni l'image
 * afin d'améliorer la SEO
 *
 * @param {Object} req
 * @returns {String}
 */
module.exports = async function (req) {
  const slug = req.params.slug || ''
  const picture = req.params.file || ''

  const isFileExists = isFileExistsSync(`./${UPLOAD_FOLDER}/${slug}/${picture}`)

  // On vérifie si le fichier existe
  if (isFileExists && !isFileExists.valid) {
    return noPictureFile
  }
  // Le fichier existe alors on vérifie si il est présent dans la base de données
  else {
    const data = await Db.get({
      query: 'SELECT picture FROM `recipes_pictures` WHERE ? AND ? LIMIT 1',
      preparedStatement: [{ picture }, { slug }],
    })
    const isExist = data && data[0] ? true : false

    return isExist ? `${slug}/${picture}` : noPictureFile
  }
}
