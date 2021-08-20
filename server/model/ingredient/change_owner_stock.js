const { Db, Jwt, Misc, Form, Settings } = require('../../middleware/index')
const { IngredientManager } = require('../../constructor/index')

module.exports = async function (req) {
  const query = req.query,
    params = req.body.params,
    access_token = query['access_token'] || ''

  Form.sanitizeEachData(params)

  const response = { success: false, toastMessage: [] }

  const accountFromToken = await Jwt.myInformation(access_token)

  if (accountFromToken && accountFromToken.username) {
    const ingredientManager = new IngredientManager({
      type: params.type,
      ingredient: params.ingredient,
      access_token,
      created_by: accountFromToken.username,
    })

    if (await ingredientManager.changeOwnerStock()) {
      response.success = true
      response.toastMessage.push({
        type: 'success',
        msg: 'Transfert de propriété reussi',
      })
    } else {
      if (!ingredientManager.exist.ingredient) {
        response.toastMessage.push({
          type: 'error',
          msg: "L'ingredient n'existe pas ou mauvais typage",
        })
      }
      if (!ingredientManager.exist.isMine) {
        response.toastMessage.push({
          type: 'error',
          msg: 'Cet ingrédient ne vous appartient pas !',
        })
      }
    }
  } else {
    response.toastMessage.push({
      type: 'error',
      msg: "Vous n'êtes pas correctement identifié",
    })
  }

  return response
}
