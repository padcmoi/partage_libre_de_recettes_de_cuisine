const Jwt = require('../jwt')

/**
 * Ce token est un admin ?
 *
 * @param {String} access_token
 *
 * @returns {Boolean}
 */
module.exports = async (access_token) => {
  const accountFromToken = await Jwt.myInformation(access_token)

  return (accountFromToken && accountFromToken.is_admin) || false
}
