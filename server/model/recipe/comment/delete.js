const { Form, Db, Jwt, Misc, Settings } = require('../../../middleware/index')

module.exports = async (req) => {
  const access_token = req.query['access_token'] || ''
  const slug = req.params.slug || ''
  const id_comment = parseInt(req.params.id) || -1

  const response = { success: false, toastMessage: [] }

  if (await Settings.user_can_comment()) {
    const accountFromToken = await Jwt.myInformation(access_token)

    if (accountFromToken) {
      const created_by = accountFromToken.username

      const isMyComment = await Misc.isMyComment(id_comment, slug, created_by)
      if (isMyComment.isMine) {
        // Verifie si le slug existe
        if (await Misc.isSlugExist(slug)) {
          await Db.delete({
            query: 'DELETE FROM `recipes_comments` WHERE ? AND ? AND ? LIMIT 1',
            preparedStatement: [{ id_comment }, { slug }, { created_by }],
          })

          response.toastMessage.push({
            type: 'success',
            msg: 'Votre commentaire a été supprimé',
          })
          response.success = true
        } else {
          response.toastMessage.push({
            type: 'error',
            msg: "Cette recette n'est plus accessible ou a été supprimé !",
          })
        }
      } else {
        response.toastMessage.push({
          type: 'error',
          msg: "Ce commentaire ne vous appartient pas ou n'existe pas",
        })
      }
    } else {
      response.toastMessage.push({
        type: 'error',
        msg: "Vous n'êtes pas correctement identifié",
      })
    }
  } else {
    response.toastMessage.push({
      type: 'error',
      msg: 'Commentaire désactivé',
    })
  }

  return response
}
