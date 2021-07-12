/**
 * Obtient un chiffre aléatoire compris entre 2 valeurs
 *
 * @param {Number} min
 * @param {Number} max
 *
 * @returns {Number}
 */
module.exports = (min = 0, max = 100) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
