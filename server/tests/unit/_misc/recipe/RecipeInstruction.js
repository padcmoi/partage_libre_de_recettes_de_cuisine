module.exports = class RecipeInstruction {
  constructor(request, csrf, token) {
    this.request = request || null
    this.csrf = csrf || undefined
    this.token = token || ''
  }

  check() {
    if (!this.request) return false
    else if (!this.token || this.token === '') return false
    else if (typeof this.csrf != 'string') return false
    else return true
  }

  /**
   * Ajoute une instruction en le positionnant
   *
   * @param {String} slug
   * @param {Number} position
   * @param {Object} params
   *
   * @returns {Object}
   */
  async add(slug, position, params) {
    if (!this.check()) return null
    else if (typeof slug != 'string') return null
    else if (typeof position != 'number' || isNaN(position)) return null
    else if (typeof params != 'object') return null

    const response = await this.request
      .post(
        `/recipe/instruction/${slug}/${position}?access_token=${this.token}`
      )
      .set('csrf-token', this.csrf)
      .send({ params })
      .then((response) => response.body)

    // delete response.execution_time

    return response
  }

  /**
   * Change une instruction et le positionnement
   *
   * @param {String} slug
   * @param {Number} position
   * @param {Object} params
   *
   * @returns {Object}
   */
  async change(slug, position, params) {
    if (!this.check()) return null
    else if (typeof slug != 'string') return null
    else if (typeof position != 'number' || isNaN(position)) return null
    else if (typeof params != 'object') return null

    const response = await this.request
      .put(`/recipe/instruction/${slug}/${position}?access_token=${this.token}`)
      .set('csrf-token', this.csrf)
      .send({ params })
      .then((response) => response.body)

    delete response.execution_time

    return response
  }

  /**
   * Change l'ordre d'affichage d'une instruction
   *
   * @param {String} slug
   * @param {Number} old
   * @param {Number} New
   *
   * @returns {Object}
   */
  async move(slug, old, New) {
    if (!this.check()) return null
    else if (typeof slug != 'string') return null
    else if (typeof old != 'number' || isNaN(old)) return null
    else if (typeof New != 'number' || isNaN(New)) return null

    const response = await this.request
      .put(
        `/recipe/instruction/${slug}/position/${old}/${New}?access_token=${this.token}`
      )
      .set('csrf-token', this.csrf)
      .send()
      .then((response) => response.body)

    delete response.execution_time

    return response
  }

  /**
   * Retire une instruction par le positionnement
   *
   * @param {String} slug
   * @param {Number} position
   *
   * @returns {Object}
   */
  async remove(slug, position) {
    if (!this.check()) return null
    else if (typeof slug != 'string') return null
    else if (typeof position != 'number' || isNaN(position)) return null

    const response = await this.request
      .delete(
        `/recipe/instruction/${slug}/${position}?access_token=${this.token}`
      )
      .set('csrf-token', this.csrf)
      .send()
      .then((response) => response.body)

    delete response.execution_time

    return response
  }
}
