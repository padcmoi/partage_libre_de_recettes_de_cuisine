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
}
