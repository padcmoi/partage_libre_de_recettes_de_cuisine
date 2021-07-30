const mysql = require('mysql')

module.exports = {
  /**
   * Regles SQL personnalisées pour les images uploadés
   * qui prend en compte le maximum d'images
   *
   * @returns {Object}
   */
  addPictures() {
    const MAX_PICTURES = parseInt(process.env.MAX_PICTURES) || 7

    const CustomSqlRules = {
      leftJoin: [],
      prepStat: [],
    }

    for (let i = 0; i < MAX_PICTURES; i++) {
      CustomSqlRules.leftJoin.push(
        `LEFT JOIN show_picture_num${i} AS sp${i} ON(r.slug = sp${i}.slug )`
      )
      CustomSqlRules.prepStat.push(`sp${i}.show_picture_num${i}`)
    }

    return CustomSqlRules
  },

  /**
   * Regles SQL personnalisées pour l'affichage par types alimentaires
   *
   * @param {Object} query
   * @param {Boolean} and1 - Débute la requete SQL avec un AND
   * @param {Boolean} and2 - Termine la requete SQL avec un AND
   *
   * r.slug = ( SELECT slug FROM `foods_types`
   *  WHERE slug = r.slug AND (
   *    food LIKE 'vegetarien' OR food LIKE 'vegan'
   *  )
   * LIMIT 1 )
   *
   * @returns {String}
   */
  showByFoodsTypes(query, and1 = false, and2 = false) {
    let foodTypes = '',
      foodType = []

    if (query && query['foodType']) {
      for (const type of query['foodType'].split(',')) {
        foodType.push(`food LIKE ${mysql.escape(type)}`)
      }

      if (and1) foodTypes += 'AND '
      foodTypes += 'r.slug = '
      foodTypes += '( SELECT slug FROM `foods_types` WHERE slug = r.slug AND ('
      foodTypes += `${foodType.join(' OR ')}`
      foodTypes += ') LIMIT 1 ) '
      if (and2) foodTypes += ' AND '
    }

    return foodTypes
  },
}
