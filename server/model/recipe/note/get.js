const { Misc } = require('../../../middleware/index')

module.exports = async function (slug) {
  const response = { global: await Misc.globalEvaluateNote(slug) }

  Object.assign(response.global, { slug })

  return response
}
