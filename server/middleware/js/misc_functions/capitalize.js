/**
 * formate la première lettre en majuscule
 *
 * @param {String} str
 *
 * @returns {String}
 */
module.exports = (str) => {
  if (typeof str !== 'string') return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}
