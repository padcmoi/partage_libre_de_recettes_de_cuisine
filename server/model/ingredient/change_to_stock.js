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
      ingredient: params.ingredient,
      picture: params.picture,
      type: params.type,
      new_type: params.new_type,
      new_ingredient: params.new_ingredient,
      access_token,
      created_by: accountFromToken.username,
    })

    const changeToStock = await ingredientManager.changeToStock()

    const exist = ingredientManager.exist

    if (changeToStock) {
      response.success = true
      response.toastMessage.push({
        type: 'success',
        msg: 'Ingrédient modifié',
      })
    } else {
      if (!exist.type) {
        response.toastMessage.push({
          type: 'error',
          msg: "Type d'aliment existe déja",
        })
      }
      if (!exist.ingredient || exist.ingred_bad_type) {
        response.toastMessage.push({
          type: 'error',
          msg: "L'ingredient n'existe pas ou mauvais typage",
        })
      }
      if (!exist.unit) {
        response.toastMessage.push({
          type: 'error',
          msg: "L'unité de mesure n'existe pas",
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
