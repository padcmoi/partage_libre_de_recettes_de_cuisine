const FixtureManager = require('./FixtureManager')
const goLogin = require('./goLogin')

/**
 * Crée un compte en base de données
 * Se connecte
 *
 * @param {Object} request
 * @param {String} password
 *
 * @returns {Object}
 */
module.exports = async (request, password = '&_tests_units') => {
  const second_account = {
    fixtureManager: null,
    fixtures: null,
    response: null,
    access_token: '',
  }
  second_account.fixtureManager = new FixtureManager()
  second_account.fixtures = await second_account.fixtureManager.get()
  second_account.response = await goLogin(
    request,
    second_account.fixtures.username,
    '&_tests_units'
  )
  second_account.access_token = second_account.response.access_token || ''

  return second_account
}
