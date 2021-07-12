const { BootstrapTable } = require('./bootstrap/index')

const bootstrap = {
  /**
   * For component Table
   *
   * @param {Object} query
   * @param {Array} allowed_orderBy
   * @param {Array} allowed_where
   * @returns {Object}
   */
  table(query, allowed_orderBy = [], allowed_where = []) {
    const bootstrapTable = new BootstrapTable(
      query,
      allowed_orderBy,
      allowed_where
    )
    return bootstrapTable
  },
}

module.exports = bootstrap
