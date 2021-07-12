/**
 * formate la chaine de caractères en minuscule
 *
 * @param {String} str
 *
 * @returns {String}
 */
module.exports = (str) => {
  if (typeof str !== 'string') return str
  return str.toLowerCase()
}
