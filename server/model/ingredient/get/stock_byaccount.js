const { Misc } = require('../../../middleware/index')

module.exports = async function (req) {
  const response = await Misc.getIngredientsList.byAccount(req.query)

  return response
}
