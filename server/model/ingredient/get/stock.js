const {} = require('../../../middleware/index')
const { MultipleData } = require('../../../constructor/index')

module.exports = async function (req) {
  const response = { success: false, toastMessage: [] }

  const multipleData = new MultipleData(response)
  await multipleData.ingredientsList(req.query)

  console.log(response)

  const ingredientsList = response.ingredientsList

  if (ingredientsList && Array.isArray(ingredientsList.data)) {
    if (ingredientsList.data.length > 0) response.success = true
  }

  return response
}
