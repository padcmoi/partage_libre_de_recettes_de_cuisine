const { Db, Jwt, Misc } = require('../../middleware/index')
const { PictureManager } = require('../../constructor/index')

module.exports = async function (access_token, slug) {
  const accountFromToken = await Jwt.myInformation(access_token)
  const toastMessage = []
  const response = { success: false, delete: false }

  if (accountFromToken) {
    const isMyRecipe = await Misc.isMyRecipe(accountFromToken.username, slug)

    // Accepted data
    if (accountFromToken.id && isMyRecipe.isMine) {
      const _delete = await Db.delete({
        query: 'DELETE FROM `recipes` WHERE ? AND ? LIMIT 1',
        preparedStatement: [
          { created_by: accountFromToken.username },
          { slug },
        ],
      })

      response.success = _delete > 0 || false
      response.delete = _delete > 0 || false

      if (response.delete) {
        // Supprimer l'espace pour les images
        const pictureManager = new PictureManager(slug)
        await pictureManager.deleteSpace() // Effacer les eventuelles images

        toastMessage.push({
          type: 'success',
          msg: `Suppression de la recette ${isMyRecipe.currentRecipe.title}`,
        })
      }
    } else if (!isMyRecipe.isMine) {
      toastMessage.push({
        type: 'error',
        msg: 'Cette recette ne vous appartient pas !',
      })
    }
  } else {
    // Refused access

    // Bad Jwt Access
    if (!accountFromToken) {
      toastMessage.push({
        type: 'error',
        msg: "Vous n'êtes pas correctement identifié",
      })
    }
  }

  return Object.assign(response, { toastMessage })
}
