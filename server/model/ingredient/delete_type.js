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
        type: params.type || '-',
        force: params.force ? true : false,
        access_token,
      })

      const exist = ingredientManager.exist

      if (await ingredientManager.removeType()) {
        response.toastMessage.push({
          type: 'success',
          msg: "Type d'aliment supprimé",
        })
        response.success = true
      } else {
        if (exist.count_ingredient_use > 0) {
          response.toastMessage.push({
            type: 'error',
            msg: "Type d'aliment utilisé dans une recette",
          })
        } else if (exist.count_ingredient_list > 0) {
          response.toastMessage.push({
            type: 'warning',
            msg: `Il y a ${exist.count_ingredient_list} ingrédient(s) associé(s) à ce type`,
          })
        } else {
          response.toastMessage.push({
            type: 'error',
            msg: "Type d'aliment inéxistant",
          })
        }
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
