const jsonwebtoken = require('jsonwebtoken')
const Db = require('./db')

const jwt = {
  /**
   * Génére un jeton en incluant un payload
   *
   * @param {Object} payload
   *
   * @returns {String} token
   */
  async make(payload = { userId: -1, username: null }) {
    const token = jsonwebtoken.sign(payload, process.env.JWT_PRIVATE_KEY, {
      algorithm: 'HS256',
      expiresIn: parseInt(process.env.JWT_EXPIRES_IN),
    })

    return token
  },

  /**
   * Vérifie si c'est un jeton JWT
   * et si sa validité horaire est correct et retourne vrai
   *
   * @param {String} token
   *
   * @returns {Boolean}
   */
  isValid(token = '') {
    try {
      jsonwebtoken.verify(token, process.env.JWT_PRIVATE_KEY)
    } catch (error) {
      return false
    }
    return true
  },

  /**
   * Retourne seulement la partie Payload d'un jeton
   * à condition qu'il soit valide,
   * le cas échéant retourne un format payload standard
   *
   * @param {String} token
   * @param {Boolean} complete - affiche les clés iat , exp
   *
   * @returns {Object} payload
   */
  async read(token = '', complete = false) {
    const payload = this.isValid(token)
      ? jsonwebtoken.decode(token, { complete: false })
      : null

    if (!complete && payload) {
      delete payload.iat
      delete payload.exp
    }

    return payload
  },

  /**
   * Met à jour la validité horaire du jeton,
   * à condition qu'il soit valide
   * retourne un String si valide sinon un null
   *
   * @param {String} token
   *
   * @returns {String/Object}
   */
  async update(token = '') {
    if (this.isValid(token)) {
      const existToken = await Db.get({
        query: 'SELECT is_revoke FROM jwt WHERE token = md5(?) LIMIT 1',
        preparedStatement: [token],
      })

      if (!existToken[0]) {
        return null
      } else if (existToken[0] && existToken[0].is_revoke) {
        return null
      }

      const payload = await this.read(token, true)
      const remainingTime = payload.exp - Math.floor(Date.now() / 1000)
      delete payload.iat
      delete payload.exp

      if (remainingTime <= parseInt(process.env.JWT_NOT_BEFORE)) {
        const newToken = await this.make(payload)

        const affected_row = await Db.merge({
          query:
            'UPDATE jwt SET token = md5(?), `expire_at` = DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL ? SECOND) WHERE token = md5(?) LIMIT 1',
          preparedStatement: [
            newToken,
            parseInt(process.env.JWT_EXPIRES_IN),
            token,
          ],
        })
        return newToken
      } else {
        return token
      }
    }
    return null
  },

  async get(payload = { userId: -1, username: null }) {
    const newToken = await this.make(payload)

    const existToken = await Db.get({
      query: 'SELECT is_revoke FROM jwt WHERE token = md5(?) LIMIT 1',
      preparedStatement: [newToken],
    })

    if (!existToken[0]) {
      Db.withTransaction()
      await Db.commit({
        query:
          'INSERT INTO jwt SET token = md5(?), expire_at = DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL ? SECOND)',
        preparedStatement: [newToken, parseInt(process.env.JWT_EXPIRES_IN)],
      })

      return newToken
    } else {
      return null
    }
  },

  /**
   * Met à jour le jeton JWT dans le compte
   *
   * @param {String} newToken
   * @param {Number} userId
   *
   * @void
   */
  async accountUpdate(newToken, userId) {
    await Db.merge({
      query: 'UPDATE account SET `jwt_hash` = MD5(?) WHERE ? LIMIT 1',
      preparedStatement: [
        // SET
        newToken,
        // WHERE
        { id: parseInt(userId) },
      ],
    })
  },

  /**
   * Avec un jeton, on recherche les informations concernant le compte
   *
   * @param {String} token
   *
   * @returns {Object} / retourne null si non trouvé
   */
  async myInformation(token) {
    if (typeof token != 'string') throw 'param not string'

    const payload = await this.read(token)
    const userId = (payload && payload.userId) || 4 // -1
    // 098f6bcd4621d373cade4e832627b4f6

    const request = await Db.get({
      query:
        'SELECT ? FROM account ' +
        'WHERE `id` = ? AND `jwt_hash` = MD5(?) ' +
        'AND `is_logged_in` = 1 AND `is_lock` = 0 LIMIT 1',
      preparedStatement: [
        Db.toSqlString(
          'id, username, mail, firstname, lastname, is_lock, is_admin,' +
            'DATE_FORMAT(`created_at`, "%d/%m/%Y %H:%i:%s") AS created_at,' +
            'DATE_FORMAT(`updated_at`, "%d/%m/%Y %H:%i:%s") AS updated_at,' +
            'DATE_FORMAT(`last_connected_at`, "%d/%m/%Y %H:%i:%s") AS last_connected_at'
        ),
        parseInt(userId),
        token,
      ],
    })

    const data = (request && request[0]) || null

    if (data) {
      for (const [key, value] of Object.entries(data)) {
        if (value === 0 || value === 1) {
          data[key] = data[key] === 1 || false
        }
      }
    }

    console.log(data)

    return data
  },
}

module.exports = jwt
