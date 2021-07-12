/**
 * formate la chaine de caractères en majuscule
 *
 * @param {String} str
 *
 * @returns {String}
 */
module.exports = (str) => {
  if (typeof str !== 'string') return str
  return str.toUpperCase()
}
