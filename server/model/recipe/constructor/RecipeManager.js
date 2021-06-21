const dataProcess = require('./dataProcess')
const dotenv = require('dotenv')
dotenv.config()

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
      _translate: false,
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
