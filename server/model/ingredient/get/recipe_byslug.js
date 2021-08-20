const {} = require('../../../middleware/index')
const { MultipleData } = require('../../../constructor/index')

module.exports = async function (req) {
  let slug = req.params.slug || ''

  const response = { success: false, toastMessage: [], ingredients: [] }

  const multipleData = new MultipleData(response)
  await multipleData.recipesIngredients(slug)

  if (Array.isArray(response.ingredients)) {
    if (response.ingredients.length > 0) response.success = true
  }

  return response
}
