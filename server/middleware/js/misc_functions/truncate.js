/**
 * Tronque une chaine de caractères avec une limite à définir
 *
 * @param {String} str
 * @param {Number} length
 *
 * @returns {String}
 */
module.exports = (str, length) => {
  if (typeof length != 'number') throw 'fn truncate arg length not number'
  else if (typeof str != 'string') throw 'fn truncate arg str not string'

  return str.length > length ? str.substring(0, length) : str
}
