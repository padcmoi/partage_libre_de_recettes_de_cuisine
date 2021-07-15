const { Misc } = require('../../../middleware/index')

module.exports = async function (_req) {
  const slug = _req.params.slug || ''

  const response = { global: await Misc.globalEvaluateNote(slug) }

  Object.assign(response.global, { slug })

  return response
}
