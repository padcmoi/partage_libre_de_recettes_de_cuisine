const {} = require('../../../middleware/index')
const { MultipleData } = require('../../../constructor/index')

module.exports = async function (req) {
  const response = {}
  const multipleData = new MultipleData(response)
  await multipleData.ingredientsType()

  return response
}
