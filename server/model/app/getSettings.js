const { Settings } = require('../../middleware/index')

module.exports = async function () {
  const data = await Settings.all()
  return data
}
