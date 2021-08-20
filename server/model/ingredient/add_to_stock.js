const { Db, Jwt, Misc, Form, Settings } = require('../../middleware/index')
const { IngredientManager } = require('../../constructor/index')

module.exports = async function (req) {
  const query = req.query,
    params = req.body.params,
    access_token = query['access_token'] || ''

  Form.sanitizeEachData(params)

  const response = { success: false, toastMessage: [] }

  if (await Settings.user_can_add_ingredient()) {
    const accountFromToken = await Jwt.myInformation(access_token)

    if (accountFromToken && accountFromToken.username) {
      const ingredientManager = new IngredientManager({
        type: params.type || '-',
        ingredient: params.ingredient || '',
        picture: params.picture || null,
        access_token,
        created_by: accountFromToken.username,
      })

      if (await ingredientManager.addToStock()) {
        response.success = true
        response.toastMessage.push({
          type: 'success',
          msg: 'Ingrédient ajouté',
        })
      } else {
        response.toastMessage.push({
          type: 'error',
          msg: "L'ingredient existe deja",
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
      msg: "Ajout d'ingredient non disponible",
    })
  }

  return response
}
