const { Settings } = require('../../middleware/index')
const dotenv = require('dotenv')
dotenv.config()

module.exports = async function () {
  const data = await Settings.all()
  return data
}
