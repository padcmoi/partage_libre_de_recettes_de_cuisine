const getRandomInt = require('./getRandomInt')

/**
 * Génére des caractères aléatoires
 *
 * @param {Number} size
 * @param {String} letters
 *
 * @returns {String}
 */
module.exports = (size = 32, letters = 'azertyuiopqsdfghjklmwxcvbn') => {
  let string = ''
  for (let i = 0; i < size; i++) {
    string += letters[getRandomInt(0, letters.length - 1)]
  }
  return string
}
