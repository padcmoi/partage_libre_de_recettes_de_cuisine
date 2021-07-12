const { Db, Settings } = require('../../middleware/index')

/**
 *
 * @param {Object} _
 * @returns
 */
module.exports = async function (_ = { username }) {
  const username = _.username.toLowerCase() || ''
  if (await Settings.maintenance()) {
    // maintenance
    return {
      isAvailable: true,
    }
  }

  // SELECT * FROM account WHERE `id` = 1 AND `jwt_hash` = MD5('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3NfdG9rZW4iOm51bGwsInVzZXJJZCI6MSwidXNlcm5hbWUiOiJwYWRjbW9pIiwiaXNMb2dnZWRJbiI6dHJ1ZSwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTYxNjIwMDU2MSwiZXhwIjoxNjE2MjAwNTkxfQ.44Q6te_RKwcgRPAuOwBQASQOXS7WjjYwKuBDvQnAWN0') LIMIT 1
  let data = await Db.get({
    query: 'SELECT id, username, is_lock FROM account WHERE ? LIMIT 1',
    preparedStatement: [{ username }],
  })

  let accountData = data && data[0]
  let isAvailable = accountData && accountData.username ? false : true
  let isLocked = accountData && accountData.is_lock ? true : false

  const result = { isAvailable, isLocked }

  if (isAvailable) {
    delete result.isLocked
  }

  return result
}
