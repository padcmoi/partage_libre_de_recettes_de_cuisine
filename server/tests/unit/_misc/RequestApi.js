const getCsrfToken = require('./getCsrfToken')

module.exports = class RequestApi {
  constructor(request, csrf) {
    this.request = request || null
    this.csrf = csrf || null
  }

  /**
   *
   */
  async header() {
    this.csrf = await getCsrfToken(request)
  }

  /**
   *
   * @param {*} url
   * @returns
   */
  async get(url) {
    const response = await this.request
      .get(url)
      .then((response) => response.body)

    return response
  }

  /**
   *
   * @param {*} url
   * @param {*} params
   * @returns
   */
  async post(url, params = {}) {
    const response = await this.request
      .post(url)
      .set('csrf-token', this.csrf)
      .send({
        params,
      })
      .then((response) => response.body)

    return response
  }

  /**
   *
   * @param {*} url
   * @param {*} params
   * @returns
   */
  async put(url, params = {}) {
    const response = await this.request
      .put(url)
      .set('csrf-token', this.csrf)
      .send({
        params,
      })
      .then((response) => response.body)

    return response
  }

  /**
   *
   * @param {*} url
   * @param {*} params
   * @returns
   */
  async delete(url, params = {}) {
    const response = await this.request
      .delete(url)
      .set('csrf-token', this.csrf)
      .send({
        params,
      })
      .then((response) => response.body)

    return response
  }
}
