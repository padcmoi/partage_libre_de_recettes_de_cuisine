const { Db, Jwt, Misc, Form, Settings } = require('../../middleware/index')
const { IngredientManager } = require('../../constructor/index')

module.exports = async function (req) {
  const query = req.query,
    slug = req.params.slug || '',
    id_ingredients = req.params.id_ingredients || '',
    params = req.body.params,
    access_token = query['access_token'] || ''

  Form.sanitizeEachData(params)

  const response = { success: false, toastMessage: [] }

  const accountFromToken = await Jwt.myInformation(access_token)

  if (accountFromToken && accountFromToken.username) {
    const isMyRecipe = await Misc.isMyRecipe(accountFromToken.username, slug)

    if (isMyRecipe.isMine) {
      // console.log(isMyRecipe.isMine)
      const ingredientManager = new IngredientManager({
        slug,
        id_ingredients,
        quantity: params.quantity || undefined,
        type: params.type || undefined,
        ingredient: params.ingredient || undefined,
        unit: params.unit || undefined,
        access_token,
      })

      const changeToRecipe = await ingredientManager.changeToRecipe()

      const exist = ingredientManager.exist

      if (changeToRecipe) {
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
