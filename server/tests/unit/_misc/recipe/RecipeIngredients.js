const { Misc, Db } = require('../../../../middleware/index')

module.exports = class RecipeIngredients {
  constructor(request, csrf, token) {
    this.request = request || null
    this.csrf = csrf || undefined
    this.token = token || ''
  }

  /**
   * Check tous les prérequis pour une connexion vers l'Api
   *
   * @returns {Boolean}
   */
  check() {
    if (!this.request) return false
    else if (!this.token || this.token === '') return false
    else if (typeof this.csrf != 'string') return false
    else return true
  }

  /**
   *
   *
   * @param {String} ingredient
   * @param {String} type
   * @param {String} picture
   *
   * @returns {Object}
   */
  async add(ingredient, type, picture = null) {
    if (!this.check()) return null
    else if (typeof ingredient != 'string') return null
    else if (typeof type != 'string') return null

    const params = { picture, type, ingredient }

    const response = await this.request
      .post(`/ingredient/stock?access_token=${this.token}`)
      .set('csrf-token', this.csrf)
      .send({ params })
      .then((response) => response.body)

    // delete response.execution_time

    return response
  }

  /**
   *
   *
   * @param {String} slug
   * @param {String} ingredient
   * @param {Number} quantity
   * @param {String} unit
   *
   * @returns {Object}
   */
  async use(slug, ingredient, quantity, unit) {
    if (!this.check()) return null
    else if (typeof slug != 'string') return null
    else if (typeof ingredient != 'string') return null
    else if (typeof quantity != 'number') return null
    else if (typeof unit != 'string') return null

    const params = { ingredient, quantity, unit }

    const response = await this.request
      .post(`/ingredient/recipe/${slug}?access_token=${this.token}`)
      .set('csrf-token', this.csrf)
      .send({ params })
      .then((response) => response.body)

    // delete response.execution_time

    return response
  }
}
