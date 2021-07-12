/**
 * Arrondit un nombre entier
 *
 * @param {Number} number
 * @param {Number} ends
 *
 * @returns {Number}
 */
module.exports = (number, ends = 0) => {
  return parseFloat(number.toFixed(ends))
}
