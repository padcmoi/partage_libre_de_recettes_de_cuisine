const { Db, Jwt } = require('../../middleware/index')
const { PictureManager } = require('../../constructor/index')

module.exports = async function (access_token, slug) {
  const accountFromToken = await Jwt.myInformation(access_token)
  const toastMessage = []
  const response = { success: false, delete: false }

  if (accountFromToken) {
    const data = await Db.get({
      query: 'SELECT slug,title FROM `recipes` WHERE ? AND ? LIMIT 1',
      preparedStatement: [{ created_by: accountFromToken.username }, { slug }],
    })

    const currentRecipe = (data && data[0]) || {}
    const isMine = data && data[0] ? true : false

    // Accepted data
    if (accountFromToken.id && isMine) {
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
          msg: `Suppression de la recette ${currentRecipe.title}`,
        })
      }
    } else if (!isMine) {
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
