const Db = require('../db')

// SELECT * FROM `recipes_instructions` WHERE slug = 'pizza-orientale' ORDER BY `num_step` DESC
// SELECT * FROM `recipes_instructions` WHERE id_instructions > 100 ORDER BY `num_step` DESC
module.exports = {
  /**
   * Vérifie qu'au moins une instruction est présente en base de données
   *
   * @param {String} slug
   * @param {Number} num_step
   *
   * @returns {Boolean}
   */
  async isExist(slug, num_step) {
    const sql_request = await Db.get({
      query: 'SELECT * FROM `recipes_instructions` WHERE ? AND ? LIMIT 1',
      preparedStatement: [{ slug }, { num_step }],
    })

    return sql_request && sql_request[0] ? true : false
  },

  /**
   * Décale en incrementant l'instruction
   *
   * @param {String} slug
   * @param {Number} num_step
   *
   * @void
   */
  async insert(slug, num_step) {
    if (await this.isExist(slug, num_step)) {
      await Db.merge({
        query:
          'UPDATE `recipes_instructions` SET `num_step` = `num_step` + 1 ' +
          'WHERE ? AND num_step >= ? ORDER BY `num_step` ASC',
        preparedStatement: [{ slug }, num_step],
      })
    }
  },

  /**
   * Récupère toutes les lignes des instructions en base de données
   *
   * @param {String} slug
   * @param {Boolean} desc
   *
   * @returns {Array}
   */
  async getRows(slug, desc = true) {
    const order = desc ? 'DESC' : 'ASC'

    const rows = await Db.get({
      query:
        'SELECT `id_instructions`,`num_step`,`instruction`,`picture` ' +
        'FROM `recipes_instructions` WHERE ? ORDER BY `num_step` ' +
        order,
      preparedStatement: [{ slug }],
    })

    return rows
  },

  /**
   * Supprimer les espaces vides et réogarnise les données en partant de 0
   *
   * @param {String} slug
   *
   * @returns {Array}
   */
  async reorganize(slug) {
    const rows = await this.getRows(slug, false)

    for (let num_step = 0; num_step < rows.length; num_step++) {
      if (typeof rows[num_step].num_step != 'number') continue
      if (typeof rows[num_step].id_instructions != 'number') continue
      if (num_step === rows[num_step].num_step) continue
      await Db.merge({
        query: 'UPDATE `recipes_instructions` SET ? WHERE ? LIMIT 1',
        preparedStatement: [
          { num_step },
          { id_instructions: rows[num_step].id_instructions },
        ],
      })
    }

    return await this.getRows(slug, false)
  },
}
