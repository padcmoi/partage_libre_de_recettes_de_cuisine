/**
 * Constructor
 *
 * @param {Object} obj
 */
const IngredientManager = function (obj = {}) {
  this._resetStateAttribute()
  this.checkDb()

  // On génére en fonction de l'objet les attributs
  for (const [key, value] of Object.entries(obj)) this[key] = value
}

/**
 * Attributs d'états
 */
IngredientManager.prototype._resetStateAttribute = function () {
  this.exist = {
    is_admin: null,
    type: null,
    new_type: null,
    ingredient: null,
    new_ingredient: null,
    ingred_bad_type: null,
    unit: null,
  }
}

/**
 * Methodes chargées dynamiquement
 */
const path = './constructor/ingredient/IngredientManager/'
const files = require('readdir').readSync(path, ['**.js'])

for (const file of files) {
  const split = file.split('.')[0] || []
  if (split.length === 0) continue
  const key = split.split('/')[split.split('/').length - 1]
  IngredientManager.prototype[key] = require('./IngredientManager/' + file)
}

module.exports = IngredientManager
