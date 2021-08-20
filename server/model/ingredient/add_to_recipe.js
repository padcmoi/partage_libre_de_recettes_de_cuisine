const { Db, Jwt, Misc, Form, Settings } = require('../../middleware/index')
const { IngredientManager } = require('../../constructor/index')

module.exports = async function (req) {
  const query = req.query,
    slug = req.params.slug || '',
    params = req.body.params,
    access_token = query['access_token'] || ''

  Form.sanitizeEachData(params)

  const response = { success: false, toastMessage: [] }

  const accountFromToken = await Jwt.myInformation(access_token)

  if (accountFromToken && accountFromToken.username) {
    const isMyRecipe = await Misc.isMyRecipe(accountFromToken.username, slug)

    if (isMyRecipe.isMine) {
      const ingredientManager = new IngredientManager({
        slug,
        quantity: params.quantity || 1,
        type: params.type || '-',
        ingredient: params.ingredient || '',
        unit: params.unit || '',
        access_token,
      })

      const addToRecipe = await ingredientManager.addToRecipe()

      const exist = ingredientManager.exist

      if (addToRecipe) {
        response.success = true
        response.id_ingredients = parseInt(addToRecipe)
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
            msg: "L'ingredient n'existe pas ou n'a pas été ajouté de la bonne manière",
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
        msg: 'Cette recette ne vous appartient pas !',
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
