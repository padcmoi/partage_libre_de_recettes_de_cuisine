const index = {}

const files = require('readdir').readSync('./middleware/js/misc_functions/', [
  '**.js',
])

for (const file of files) {
  const split = file.split('.')[0] || []
  if (split.length === 0) continue

  const key = split.split('/')[split.split('/').length - 1]

  index[key] = require(`./misc_functions/${file}`)
}

module.exports = index
