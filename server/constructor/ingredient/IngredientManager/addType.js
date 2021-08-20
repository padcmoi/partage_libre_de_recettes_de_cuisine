const Misc = require('../../../middleware/js/misc')
const Db = require('../../../middleware/js/db')

/**
 * @returns {Boolean}
 */
module.exports = async function () {
  if (!this.type || typeof this.picture === 'undefined') return false
  else if (!this.access_token) return false

  this.exist.is_admin = await Misc.isAdmin(this.access_token)

  await this.typeExist()

  if (this.exist.type) return false

  const type = this.type,
    picture = this.picture

  await Db.commit({
    query: 'INSERT INTO `ingredients_type` SET ?',
    preparedStatement: [{ type, picture }],
  })

  return true
}
