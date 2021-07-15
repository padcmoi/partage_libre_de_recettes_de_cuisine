const { Settings } = require('../../../middleware/index')
const { MultipleData } = require('../../../constructor/index')
const generate = require('../../csrf/generate')

module.exports = async function (req) {
  // Pour les formulaires
  let response = await generate(req, req.csrfToken())
  delete response.expire_at

  const maintenance = await Settings.maintenance()
  const user_can_create_recipe = await Settings.user_can_create_recipe()
  const user_can_add_ingredient = await Settings.user_can_add_ingredient()

  const toastMessage = []

  if (!maintenance && user_can_create_recipe && response['csrf_token']) {
    Object.assign(response, {
      toastMessage,
      user_can_create_recipe,
      user_can_add_ingredient,
    })

    const multipleData = new MultipleData(response)

    await multipleData.categories()
    await multipleData.foodTypesList()
    await multipleData.ingredientsList()
    await multipleData.ingredientsType()
    await multipleData.unitsList()
  } else {
    if (maintenance) {
      // Maintenance
      toastMessage.push({ msg: 'Application en maintenance' })
    } else if (!user_can_create_recipe) {
      // Recipe create disable
      toastMessage.push({
        type: 'warning',
        msg: 'La création de recettes est indisponible',
      })
    }
  }

  return response
}
