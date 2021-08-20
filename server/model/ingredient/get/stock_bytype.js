const { Misc } = require('../../../middleware/index')

module.exports = async function (req) {
  const response = await Misc.getIngredientsList.byType(req.query)

  return response
}
