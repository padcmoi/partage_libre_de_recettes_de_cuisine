const { Db, Jwt, Misc, Form } = require('../../middleware/index')
const { IngredientManager } = require('../../constructor/index')

module.exports = async function (req) {
  const query = req.query,
    params = req.body.params,
    access_token = query['access_token'] || ''

  Form.sanitizeEachData(params)

  const response = { success: false, toastMessage: [] }

  const accountFromToken = await Jwt.myInformation(access_token)

  if (accountFromToken && accountFromToken.username) {
    if (accountFromToken.is_admin) {
      const ingredientManager = new IngredientManager({
        type: params.type,
        new_type: params.new_type,
        picture: params.picture,
        access_token,
      })

      const exist = ingredientManager.exist

      if (await ingredientManager.changeType()) {
        response.toastMessage.push({
          type: 'success',
          msg: "Type d'aliment modifié",
        })
        response.success = true
      } else if (!exist.type) {
        response.toastMessage.push({
          type: 'error',
          msg: "Type d'aliment existe déja",
        })
      } else {
        response.toastMessage.push({
          type: 'error',
          msg: "Type d'aliment inéxistant ou image inéxistante",
        })
      }
    } else {
      response.toastMessage.push({
        type: 'error',
        msg: 'Autorisation requise',
      })
    }
  } else {
    response.toastMessage.push({
      type: 'error',
      msg: "Vous n'êtes pas correctement identifié",
    })
  }

  return response
}
