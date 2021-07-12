const index = {}

for (const file of require('readdir').readSync('./middleware/js/', ['*.js'])) {
  const split = file.split('.')[0] || []
  if (split.length === 0) continue

  const key = split.charAt(0).toUpperCase() + split.slice(1)
  const value = require(`./js/${file}`)

  index[key] = value
}

// console.log(Object.keys(index))

module.exports = index
