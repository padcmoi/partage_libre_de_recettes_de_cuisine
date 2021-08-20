const { Db, Jwt, Misc, Form, Settings } = require('../../middleware/index')
const { IngredientManager } = require('../../constructor/index')

module.exports = async function (req) {
  const query = req.query,
    slug = req.params.slug || '',
    id_ingredients = req.params.id_ingredients || '',
    access_token = query['access_token'] || ''

  const response = { success: false, toastMessage: [] }

  const accountFromToken = await Jwt.myInformation(access_token)

  if (accountFromToken && accountFromToken.username) {
    const isMyRecipe = await Misc.isMyRecipe(accountFromToken.username, slug)

    if (isMyRecipe.isMine) {
      const ingredientManager = new IngredientManager({
        slug,
        id_ingredients,
        access_token,
      })

      const removeRecipe = await ingredientManager.removeRecipe()

      if (removeRecipe) {
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
