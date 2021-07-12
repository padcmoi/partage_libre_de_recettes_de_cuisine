const Db = require('./db')

const db = {
  async load() {
    const select = await Db.get({
      query: 'SELECT ? FROM settings LIMIT 1',
      preparedStatement: [
        Db.toSqlString(
          '*, DATE_FORMAT(`updated_at`, "%d/%m/%Y %H:%i:%s") AS updated_at'
        ),
      ],
    })

    return select && select[0]
  },
}

module.exports = {
  /**
   * Retourne toutes les clés/valeurs de la base de données
   * les champs 0 & 1 seront convertis en Boolean
   *
   * @returns {Object}
   */
  async all() {
    const data = await db.load()

    for (const [key, value] of Object.entries(data)) {
      if (value === 0 || value === 1) {
        data[key] = data[key] === 1 || false
      }
    }

    return data
  },

  /**
   * retourne la valeur Boolean du mode maintenance
   *
   * @returns {Boolean}
   */
  async maintenance() {
    const data = await db.load()

    return data.maintenance === 1 || false
  },

  /**
   * retourne la valeur Boolean création de compte disponible
   *
   * @returns {Boolean}
   */
  async can_create_account() {
    const data = await db.load()

    return data.can_create_account === 1 || false
  },

  /**
   * retourne la valeur Boolean création de recette disponible
   *
   * @returns {Boolean}
   */
  async user_can_create_recipe() {
    const data = await db.load()

    return data.user_can_create_recipe === 1 || false
  },

  /**
   * retourne la valeur Boolean commentaires disponible
   *
   * @returns {Boolean}
   */
  async user_can_comment() {
    const data = await db.load()

    return data.user_can_comment === 1 || false
  },

  /**
   * retourne la valeur Boolean utilisateur peut ajouter un ingrédient
   *
   * @returns {Boolean}
   */
  async user_can_add_ingredient() {
    const data = await db.load()

    return data.user_can_add_ingredient === 1 || false
  },

  /**
   * retourne la date de la dernière modification de la table settings
   *
   * @returns {String}
   */
  async updated_at() {
    const data = await db.load()

    return data.updated_at
  },
}
