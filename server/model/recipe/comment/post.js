const { Form, Db, Jwt, Misc, Settings } = require('../../../middleware/index')

module.exports = async (req) => {
  const access_token = req.query['access_token'] || ''
  const slug = req.params.slug || ''

  const comment = Form.sanitizeEachData(req.body.params).comment

  const response = { success: false, toastMessage: [] }

  if (await Settings.user_can_comment()) {
    // to do verifier commentaire
    if (comment) {
      const accountFromToken = await Jwt.myInformation(access_token)

      if (accountFromToken) {
        const created_by = accountFromToken.username

        // Verifie si le slug existe
        if (await Misc.isSlugExist(slug)) {
          await Db.commit({
            query: 'INSERT INTO `recipes_comments` SET ?',
            preparedStatement: [{ comment, slug, created_by }],
          })

          response.toastMessage.push({
            type: 'success',
            msg: 'Votre commentaire a été ajouté',
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
          msg: "Vous n'êtes pas correctement identifié",
        })
      }
    } else {
      response.toastMessage.push({
        type: 'error',
        msg: 'Commentaire trop court',
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
