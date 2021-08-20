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
      type: params.type || '-',
      ingredient: params.ingredient || '',
      access_token,
      created_by: accountFromToken.username,
    })

    const removeStock = await ingredientManager.removeStock()

    if (removeStock) {
      response.success = true
      response.toastMessage.push({
        type: 'success',
        msg: 'Ingrédient supprimé',
      })
    } else {
      response.toastMessage.push({
        type: 'error',
        msg: 'Rien à supprimer',
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
