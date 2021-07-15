const { Db, Jwt, Misc } = require('../../middleware/index')
const modelRecipe = require('../recipe')

const del = require('del')

const UPLOAD_FOLDER = process.env.UPLOAD_FOLDER || 'files_uploads'

module.exports = async function (req) {
  let max_uploads,
    response = { success: false, toastMessage: [] }

  const access_token = req.body['access_token'] || ''
  const slug = req.params.slug || ''
  const num_step = req.params.num_step

  const accountFromToken = await Jwt.myInformation(access_token)

  if (req.files[0] && accountFromToken) {
    max_uploads = await Misc.getMaxUploads(accountFromToken.username)

    const isMyRecipe = await Misc.isMyRecipe(accountFromToken.username, slug)

    const files = req.files
    response.toastMessage = files[0].toastMessage
    // console.log(files)

    if (num_step >= max_uploads) {
      files[0].passedTest = false
      response.toastMessage.push({
        type: 'error',
        msg: "Limite atteinte d'upload",
      })
    }

    // Accepted data
    if (!isMyRecipe.isMine) {
      files[0].passedTest = false
      response.toastMessage.push({
        type: 'error',
        msg: 'Cette recette ne vous appartient pas !',
      })
    }

    const maxSize = parseInt(process.env.UPLOAD_MAX_SIZE_OCTETS) || 512000

    if (files[0].size > maxSize) {
      files[0].passedTest = false

      const fBytes = Misc.formatBytes

      response.toastMessage.push({
        type: 'error',
        msg: `Image trop lourde (${fBytes(files[0].size)}) / limitée à ${fBytes(
          maxSize
        )}`,
      })
    }

    if (files[0].passedTest && accountFromToken.id) {
      response.success = true
      response.filename = files[0].filename

      // Efface si possible l'ancienne image sous le meme numero num_step en BDD & Fichier
      const searchPictureOnNumStep = await Db.get({
        query:
          'SELECT picture FROM `recipes_pictures` WHERE `num_step` = ? AND `slug` = ? LIMIT 1',
        preparedStatement: [num_step, slug],
      })

      if (searchPictureOnNumStep[0]) {
        del.sync([
          `./${UPLOAD_FOLDER}/${slug}/${searchPictureOnNumStep[0].picture}`,
        ])

        await Db.delete({
          query:
            'DELETE FROM `recipes_pictures` WHERE `num_step` = ? AND `slug` = ? LIMIT 1',
          preparedStatement: [num_step, slug],
        })
      }

      await Db.commit({
        query: 'INSERT INTO `recipes_pictures` SET ?',
        preparedStatement: [
          {
            picture: response.filename,
            num_step,
            slug,
          },
        ],
      })

      const view = await modelRecipe.view(req)

      response.pictures = view.pictures || []
    } else {
      // Tests échoués
      del.sync([`./${files[0].destination}/${files[0].filename}`])
    }
  }

  return response
}
