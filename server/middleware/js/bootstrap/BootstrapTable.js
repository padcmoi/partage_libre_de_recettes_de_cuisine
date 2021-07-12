const Form = require('../form')
const mysql = require('mysql')

module.exports = class BootstrapTable {
  constructor(query, allowed_orderBy, allowed_where) {
    this.PRIVATE = {
      filter: true,
      orderBy: true,
      limit: true,
    }

    this.limitPerPage = 30

    this.query = Form.sanitizeEachData(query, ['where'])
    this.allowed_where = this.query['where']

    this.allowed = {
      orderBy: allowed_orderBy || [],
      where: allowed_where || [],
    }

    this.return_data = {
      state: { sorter: false, limit: false, filter: false },
      orderBy: '',
      limit: '',
      filter: undefined,
      split_filter: [],
    }
  }

  /**
   * @PUBLIC
   */
  async get() {
    this.PRIVATE.filter = false
    await this.filter()

    this.PRIVATE.orderBy = false
    await this.orderBy()

    this.PRIVATE.limit = false
    await this.limit()

    return this.return_data
  }

  /**
   * @PUBLIC
   * Construit une clause WHERE à partir d'identifiers autorisés
   * Inclut l'Escape SQL
   *
   * @param {Boolean} add_where - Ajoute la clause WHERE ?
   * @returns {String} Clause SQL WHERE
   */
  async where(add_where = true) {
    // Ajoute la Clause WHERE ?
    add_where = add_where ? 'WHERE' : ''

    // Nous avons besoin des données
    await this.get()

    const split_filter = this.return_data.split_filter
    const identifiers = []
    const query = this.query['where'] || ''

    // On split dans un tableau en utilisant , comme séparateur
    const query_split = query.split(',')

    // Ici on vérifie les identifiers si ils sont autorisés
    // Etape 1/2 pour l'Escape SQL
    for (const allowed of this.allowed.where) {
      if (query_split.indexOf(allowed) === -1) continue
      identifiers.push(allowed)
    }

    // Si aucun indentifiers alors on retourne rien et on change le state
    if (identifiers.length === 0 || split_filter.length === 0) {
      this.return_data.state.filter = false
      return ''
    }

    let concatStr = []

    // On construit la requete en utilisant escapeId (identifiers) & escape (valeurs)
    // afin d'échapper les champs de toutes mauvaise requetes SQL
    // Etape 2/2 pour l'Escape SQL
    for (const key of identifiers) {
      for (const filter of split_filter) {
        concatStr.push(mysql.escapeId(key) + ' LIKE ' + mysql.escape(filter))
      }
    }

    return ' ' + add_where + ' (' + concatStr.join(' OR ') + ') '
  }

  /**
   * @PRIVATE
   * Where clause avec Like
   *
   * @void
   */
  async filter() {
    if (this.PRIVATE.filter) return console.log('Private methods')
    else this.PRIVATE.filter = true

    this.return_data.filter = ''

    let filter = '%'

    if (this.query['filter'] && this.query['filter'] != '') {
      filter += this.query['filter'] + '%'
      const split_filter = this.query['filter'].split(' ')

      for (const index in split_filter) {
        split_filter[index] = '%' + split_filter[index] + '%'
      }

      this.return_data.split_filter = split_filter
      this.return_data.state.filter = true
    }

    this.return_data.filter = filter
  }

  /**
   * @PRIVATE
   * OrderBy clause
   *
   * @void
   */
  async orderBy() {
    if (this.PRIVATE.orderBy) return console.log('Private methods')
    else this.PRIVATE.orderBy = true

    this.return_data.orderBy = ''

    if (!this.query['sortBy'] || !this.query['sortDesc']) return

    const sortBy = this.query['sortBy']
    const sortDesc = this.query['sortDesc'] === 'true' || false
    const allowed = this.allowed.orderBy.indexOf(sortBy) >= 0 || false

    if (sortBy != '' && allowed) {
      this.return_data.orderBy += ' ORDER BY '
      this.return_data.orderBy += mysql.escapeId(sortBy)
      this.return_data.orderBy += ' '
      this.return_data.orderBy += sortDesc ? 'DESC' : 'ASC'
      this.return_data.orderBy += ' '
      this.return_data.state.sorter = true
    }
  }

  /**
   * @PRIVATE
   * Limit clause
   *
   * @void
   */
  async limit() {
    if (this.PRIVATE.limit) return console.log('Private methods')
    else this.PRIVATE.limit = true

    this.return_data.limit = ''

    let limit = parseInt(this.query['currentPage']) || 0
    let offset = parseInt(this.query['perPage']) || parseInt(this.limitPerPage)

    // On définit la limite d'affichage par page
    if (offset > parseInt(this.limitPerPage)) {
      offset = parseInt(this.limitPerPage)
    }

    this.return_data.limit += ' LIMIT '
    this.return_data.limit += parseInt(limit)
    this.return_data.limit += ', '
    this.return_data.limit += parseInt(offset)
    this.return_data.limit += ' '
    this.return_data.state.limit = true
  }
}
