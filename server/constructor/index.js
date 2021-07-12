const index = {}

for (const file of require('readdir').readSync('./constructor/', ['**.js'])) {
  const split = file.split('.')[0] || []

  if (split.length === 0) continue
  if (split.toLowerCase() === 'index') continue

  const key = split.split('/')[split.split('/').length - 1]

  index[key] = require(`./${file}`)
}

module.exports = index
