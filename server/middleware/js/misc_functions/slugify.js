/**
 * Convertit une chaine de caractères en slug
 *
 * @param {String} str
 *
 * @returns {String}
 */
module.exports = (str = '') => {
  if (typeof str != 'string') throw 'fn truncate arg str not string'

  const convert = {
    'à|á|ä|â': 'a',
    'è|é|ë|ê': 'e',
    'ì|í|ï|î': 'i',
    'ò|ó|ö|ô': 'o',
    'ù|ú|ü|û': 'u',
    ñ: 'n',
    '/|_|,|;|\'|"': '-',
  }

  str = str.replace(/^\s+|\s+$/g, '').toLowerCase() // trim + lowercase

  for (const [key, value] of Object.entries(convert)) {
    str = str.replace(new RegExp(key, 'g'), value)
  }

  str = str
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-') // collapse dashes

  return str
}
