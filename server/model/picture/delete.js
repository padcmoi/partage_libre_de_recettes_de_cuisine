const { Db, Jwt, Misc } = require('../../middleware/index')

const del = require('del')

const UPLOAD_FOLDER = process.env.UPLOAD_FOLDER || 'files_uploads'

module.exports = async function (req) {
  let response = { success: false, toastMessage: [] }

  const access_token = req.query['access_token'] || ''
  const slug = req.params.slug || ''
  const num_step = req.params.num_step

  const accountFromToken = await Jwt.myInformation(access_token)

  if (accountFromToken) {
    const isMyRecipe = await Misc.isMyRecipe(accountFromToken.username, slug)

    if (isMyRecipe.isMine) {
      const searchPictureOnNumStep = await Db.get({
        query:
          'SELECT picture FROM `recipes_pictures` WHERE `num_step` = ? AND `slug` = ? LIMIT 1',
        preparedStatement: [num_step, slug],
      })

      if (searchPictureOnNumStep[0]) {
        // On retire les clés étrangères sur les instructions de recettes
        await Db.merge({
          query:
            'UPDATE `recipes_instructions` SET `picture` = NULL WHERE `picture` = ?',
          preparedStatement: [searchPictureOnNumStep[0].picture],
        })

        del.sync([
          `./${UPLOAD_FOLDER}/${slug}/${searchPictureOnNumStep[0].picture}`,
        ])

        await Db.delete({
          query:
            'DELETE FROM `recipes_pictures` WHERE `num_step` = ? AND `slug` = ? LIMIT 1',
          preparedStatement: [num_step, slug],
        })

        response.success = true

        response.toastMessage.push({
          type: 'info',
          msg: `Image supprimée`,
        })
      }
    } else {
      response.toastMessage.push(
        {
          type: 'error',
          msg: 'Requête refusée !',
        },
        {
          type: 'error',
          msg: 'Cette recette ne vous appartient pas !',
        }
      )
    }
  } else {
    response.toastMessage.push({
      type: 'error',
      msg: "Vous n'êtes pas correctement identifié",
    })
  }

  return response
}
