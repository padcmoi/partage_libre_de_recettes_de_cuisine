const Misc = require('../../middleware/js/misc')
const dataProcess = require('./DataProcess')

/**
 * @params {Object} (form_data) Données de formulaire
 * @params {Array} (form_data) Données de formulaire
 */
module.exports = class RecipeManager {
  constructor(form_data, requiredState) {
    this.PRIVATE = {
      make: true,
      check: true,
      toastMessage: true,
    }

    this.dataProcess = null
    this.failProcess = []
    this.toastMessage = []
    this.data_process = {}
    this.requiredState = requiredState || []
    this.form_data = form_data || {}
  }

  /**
   * @PUBLIC
   * Retourne les processus échoués sous forme de tableau
   * Retourne les données traitées
   *
   * @returns {Object}
   */
  async result() {
    // Nous rendons temporairement publique ces methodes pour pouvoir y accèder ...
    this.PRIVATE = {
      make: false,
      check: false,
      toastMessage: false,
    }
    await this._make()
    await this._check()
    await this._toastMessage()

    return {
      failProcess: this.failProcess,
      dataProcessed: this.data_process,
      toastMessage: this.toastMessage,
    }
  }

  /**
   * @STATIC
   * Génére des données requise à partir des données clientes
   *
   * @param {Array} params
   * @returns {Array}
   */
  static makeRequired(params) {
    const required = []

    for (const key in params) {
      switch (key) {
        case 'title':
          required.push('slugTitle')
          break
        case 'description':
          required.push('description')
          break
        case 'seasons':
          required.push('seasons')
          break
        case 'difficulty':
          required.push('difficulty')
          break
        case 'nutriscore':
          required.push('nutriscore')
          break
        case 'preparation_time':
          required.push('preparationTime')
          break
        case 'cooking_time':
          required.push('cookingTime')
          break
        case 'category':
          required.push('category')
          break
      }
    }

    return required
  }

  /**
   * @STATIC
   * Réorganise les données en provenance de la base de données
   * - définit une valeur par défaut à @count_pictures
   * - insert dans un tableau de valeurs @pictures :
   *
   * @param {Object} req_data
   * @returns {Object} req_data
   */
  static picturesReorder(req_data) {
    const MAX_PICTURES = parseInt(process.env.MAX_PICTURES) || 7

    const picturesList = []

    for (let i = 0; i < MAX_PICTURES; i++) {
      picturesList.push(`show_picture_num${i}`)
    }

    for (const data of req_data) {
      if (!data.count_pictures) {
        data.count_pictures = parseInt(0)
      }

      data.pictures = []

      for (const picture of picturesList) {
        if (data[picture]) {
          data.pictures.push(data[picture])
        }

        delete data[picture]
      }
    }

    return req_data
  }

  /**
   * @PUBLIC
   * Nettoie les données pour la lecture
   * c'est la procèdure inverse pour l'ajout/modification de données
   *
   * @param {Object} data
   * @returns {Object}
   */
  static sanitizeRead(data) {
    // Transforme en tableau les saisons
    data.seasons = []

    if (data.season_winter === 1) data.seasons.push('winter')
    if (data.season_autumn === 1) data.seasons.push('autumn')
    if (data.season_summer === 1) data.seasons.push('summer')
    if (data.season_spring === 1) data.seasons.push('spring')

    delete data.season_winter
    delete data.season_autumn
    delete data.season_summer
    delete data.season_spring

    // On rend un minimum l'anonymat dans les noms de famille
    data.lastname = Misc.truncate(data.lastname, 1)
    data.lastname += '.'

    // On change en Boolean
    data.locked_comment = data.locked_comment === 1 || false
    data.has_favorite = data.has_favorite === 1 || false

    // Supprime ce qui est inutile pour le client
    delete data.is_lock

    return data
  }

  /**
   * @PRIVATE
   * Execute dans un ordre précis les différentes méthodes asynchrone
   *
   * @void
   */
  async _make() {
    if (this.PRIVATE.make) return console.log('Private methods')
    else this.PRIVATE.make = true

    if (this.dataProcess) return
    this.dataProcess = new dataProcess(this.form_data)

    for (const key in this.form_data) {
      switch (key) {
        case 'title':
          await this.dataProcess.makeSlugTitle()
          break
        case 'description':
          await this.dataProcess.makeDescription()
          break
        case 'seasons':
          await this.dataProcess.makeSeasons()
          break
        case 'difficulty':
          await this.dataProcess.makeDifficulty()
          break
        case 'nutriscore':
          await this.dataProcess.makeNutriscore()
          break
        case 'preparation_time':
          await this.dataProcess.makePreparationTime()
          break
        case 'cooking_time':
          await this.dataProcess.makeCookingTime()
          break
        case 'category':
          await this.dataProcess.makeCategory()
          break
        case 'lock':
          await this.dataProcess.makeLock()
          break
        case 'temporary':
          await this.dataProcess.makeTemporary()
          break
      }
    }

    this.data_process = await this.dataProcess.dataProcessed()
  }

  /**
   * @PRIVATE
   * Vérifie que chaque données a bien été traité
   * retourne dans l'attribut failProcess sous forme de tableau les échecs
   *
   * @void
   */
  async _check() {
    if (this.PRIVATE.check) return console.log('Private methods')
    else this.PRIVATE.check = true

    if (!this.dataProcess) return
    const stateProcess = await this.dataProcess.getState()

    for (const state of this.requiredState) {
      if (stateProcess[state]) continue
      this.failProcess.push(state)
    }
  }

  /**
   * @PRIVATE
   * Traduit & Retourne un objet contenant les erreurs
   * failProcess en clé
   * en traduction la valeur
   *
   * @returns {Array}
   */
  async _toastMessage() {
    // Pour rappel coté client
    // msg: obj.msg || '',
    // type: obj.type || 'error',
    // mustClick: obj.mustClick || false,
    // duration: obj.duration || 10000,

    if (this.PRIVATE.toastMessage) return console.log('Private methods')
    else this.PRIVATE.toastMessage = true

    for (const value of this.failProcess) {
      switch (value) {
        case 'slugTitle':
          this.toastMessage.push(
            'Le titre de la recette est invalide ou réservé'
          )
          break
        case 'description':
          this.toastMessage.push('La description ne possède le bon format')
          break
        case 'difficulty':
          this.toastMessage.push(
            'La difficulté est inconnu de la base de données'
          )
          break
        case 'nutriscore':
          this.toastMessage.push(
            'Le nutriscore est inconnu de la base de données'
          )
          break
        case 'cookingTime':
          this.toastMessage.push('Le temps de cuisson doit être en secondes')
          break
        case 'preparationTime':
          this.toastMessage.push(
            'Le temps de préparation doit être en secondes'
          )
          break
        case 'category':
          this.toastMessage.push(
            'La catégorie est inconnu de la base de données'
          )
          break
      }
    }
  }
}
