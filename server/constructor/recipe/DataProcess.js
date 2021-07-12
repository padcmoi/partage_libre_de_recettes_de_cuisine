const Misc = require('../../middleware/js/misc')
const Db = require('../../middleware/js/db')

/**
 * @params {Object} (form_data) Données de formulaire
 */
module.exports = class DataProcess {
  constructor(form_data) {
    this.PRIVATE = {}

    this.data_process = {}
    this._state = {
      slugTitle: false,
      description: false,
      seasons: false,
      difficulty: false,
      nutriscore: false,
      cookingTime: false,
      preparationTime: false,
      category: false,
      isLock: false,
      isTemporary: false,
    }

    this.form_data = form_data
  }

  /**
   * @PUBLIC
   * Affiche le statut des actions
   *
   * @returns {Object}
   */
  async getState() {
    return this._state
  }

  /**
   * @PUBLIC
   * Retourne les données traitées
   *
   * @returns {Object}
   */
  async dataProcessed() {
    return this.data_process
  }

  /**
   * @PUBLIC
   * Check & génére le titre et la version slug du titre pour les recherches urn
   *
   * requiert un composant Input
   * @returns {Boolean} Success?
   */
  async makeSlugTitle() {
    if (typeof this.form_data.title === 'string') {
      this.data_process.title = Misc.truncate(this.form_data.title, 50)
      this.data_process.slug = Misc.slugify(this.form_data.title)
      this.data_process.slug = Misc.truncate(this.data_process.slug, 150)

      const data = await Db.get({
        query: 'SELECT slug FROM recipes WHERE slug = ? LIMIT 1',
        preparedStatement: [this.data_process.slug],
      })

      const obj = data && data[0]

      return (this._state.slugTitle = obj && obj.slug ? false : true)
    } else {
      return (this._state.slugTitle = false)
    }
  }

  /**
   * @PUBLIC
   * Check & génére la description
   *
   * requiert un composant Input ou Textarea
   */
  async makeDescription() {
    if (typeof this.form_data.description === 'string') {
      this.data_process.description = Misc.truncate(
        this.form_data.description,
        512
      )
      return (this._state.description = true)
    } else {
      return (this._state.description = false)
    }
  }

  /**
   * @PUBLIC
   * Check & génére les saisons à partir d'un tableau de valeurs
   *
   * requiert un composant CheckBox
   * @returns {Boolean} Success?
   */
  async makeSeasons() {
    if (typeof this.form_data.seasons === 'object') {
      Object.assign(this.data_process, {
        season_winter: 0,
        season_autumn: 0,
        season_summer: 0,
        season_spring: 0,
      })

      for (const season of this.form_data.seasons) {
        switch (season.toLowerCase()) {
          case 'winter':
            this.data_process.season_winter = 1
            break
          case 'autumn':
            this.data_process.season_autumn = 1
            break
          case 'summer':
            this.data_process.season_summer = 1
            break
          case 'spring':
            this.data_process.season_spring = 1
            break
        }
      }
      return (this._state.seasons = true)
    } else {
      return (this._state.seasons = false)
    }
  }

  /**
   * @PUBLIC
   * Check & génére la difficulté
   *
   * requiert un composant à valeur unique tel radio ou option
   * @returns {Boolean} Success?
   */
  async makeDifficulty() {
    if (typeof this.form_data.difficulty === 'string') {
      this._state.difficulty = true
      const difficulty = this.form_data.difficulty.toLowerCase()

      switch (difficulty) {
        case 'easy':
          this.data_process.difficulty = difficulty
          break
        case 'medium':
          this.data_process.difficulty = difficulty
          break
        case 'hard':
          this.data_process.difficulty = difficulty
          break
        default:
          this._state.difficulty = false
      }

      return this._state.difficulty
    } else {
      return (this._state.difficulty = false)
    }
  }

  /**
   * @PUBLIC
   * Check & génére le nutriscore
   *
   * requiert un composant à valeur unique comme radio ou select
   * @returns {Boolean} Success?
   */
  async makeNutriscore() {
    if (typeof this.form_data.nutriscore === 'string') {
      this._state.nutriscore = true
      const nutriscore = this.form_data.nutriscore.toUpperCase()

      switch (nutriscore) {
        case 'A':
          this.data_process.nutriscore = nutriscore
          break
        case 'B':
          this.data_process.nutriscore = nutriscore
          break
        case 'C':
          this.data_process.nutriscore = nutriscore
          break
        case 'D':
          this.data_process.nutriscore = nutriscore
          break
        case 'E':
          this.data_process.nutriscore = nutriscore
          break
        default:
          this._state.nutriscore = false
      }

      return this._state.nutriscore
    } else {
      return (this._state.nutriscore = false)
    }
  }

  /**
   * @PUBLIC
   * Check & génére le nombre en seconde à partir d'une donnée en seconde
   *
   * requiert un composant input (type number ou range)
   * ou d'autres contenant une valeur numérique
   * @returns {Boolean} Success?
   */
  async makePreparationTime() {
    if (typeof this.form_data.preparation_time === 'number') {
      this.data_process.preparation_time = parseInt(
        this.form_data.preparation_time
      )

      const state = this.data_process.preparation_time >= 0 || false
      return (this._state.preparationTime = state)
    } else {
      return (this._state.preparationTime = false)
    }
  }

  /**
   * @PUBLIC
   * Check & génére le nombre en seconde à partir d'une donnée en seconde
   *
   * requiert un composant input (type number ou range)
   * ou d'autres contenant une valeur numérique
   * @returns {Boolean} Success?
   */
  async makeCookingTime() {
    if (typeof this.form_data.cooking_time === 'number') {
      this.data_process.cooking_time = parseInt(this.form_data.cooking_time)

      const state = this.data_process.cooking_time >= 0 || false
      return (this._state.cookingTime = state)
    } else {
      return (this._state.cookingTime = false)
    }
  }

  /**
   * @PUBLIC
   * Check si la catégorie existe en base de données
   *
   * requiert un composant input text, ou autre à choix unique
   *
   * @returns {Boolean} Success?
   */
  async makeCategory() {
    if (typeof this.form_data.category === 'string') {
      const data = await Db.get({
        query: 'SELECT category FROM categories WHERE category = ? LIMIT 1',
        preparedStatement: [this.form_data.category],
      })

      const obj = data && data[0]

      Object.assign(this.data_process, obj)

      return (this._state.category = obj && obj.category ? true : false)
    } else {
      return (this._state.category = false)
    }
  }

  /**
   * @PUBLIC
   * Check la valeur & convertit cette valeur
   *
   * requiert un composant select radio à choix unique
   *
   * @returns {Boolean} Success?
   */
  async makeLock() {
    if (typeof this.form_data.lock === 'boolean') {
      const is_lock = this.form_data.lock ? 1 : 0

      Object.assign(this.data_process, { is_lock })

      return (this._state.isLock = this.form_data.lock)
    } else {
      return (this._state.isLock = false)
    }
  }

  /**
   * @PUBLIC
   * Check la valeur & convertit cette valeur
   *
   * à placer sur un formulaire qui validera étape par étape
   * le mode temporaire est à utiliser pour pouvoir créer la recette
   * la cacher afin d'ajouter les images (requiert une clé étrangère)
   * à la fin de la validation étape on cache ce mode
   *
   * Condition:
   * - Si l'utilisateur abandonne la création de recette, il pourra envoyer un delete/:slug à l'Api
   * - Si l'utilisateur quitte le formulaire, alors la recette sera purgé sous 24 heures,
   * l'utilisateur pourra toutefois reprendre la recette abandonnée à condition qu'il le fasse avant 24 heures
   *
   * @returns {Boolean} Success?
   */
  async makeTemporary() {
    this.form_data.lock = this.form_data.temporary
    await this.makeLock()

    if (typeof this.form_data.temporary === 'boolean') {
      const temporary = this.form_data.temporary ? 1 : 0

      Object.assign(this.data_process, { temporary })

      return (this._state.isTemporary = this.form_data.temporary)
    } else {
      return (this._state.isTemporary = false)
    }
  }
}
