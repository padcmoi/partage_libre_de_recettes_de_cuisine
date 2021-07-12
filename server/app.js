const express = require('express')
const createError = require('http-errors')
const logger = require('morgan')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { start, end } = require('./app/perf')
const dotenv = require('dotenv')
dotenv.config()

if (require('./app/cluster')) {
  const app = express()

  app
    .use(cors())
    // .use(logger('dev'))
    .use(express.json())
    .use(express.urlencoded({ extended: false }))
    .use(cookieParser())
    .all('*', function (req, res, next) {
      start()
      next() // pass control to the next handler
    })

  for (const file of require('readdir').readSync('controller/', ['*.js'])) {
    const split = file.split('.')[0] || []
    if (split.length === 0) continue

    const route = '/' + split.charAt(0).toUpperCase() + split.slice(1)
    const path = require(`./controller/${file}`)

    app.use(route, path)
  }

  // error handler
  app
    .use(function (req, res, next) {
      next(createError(404))
    })
    .use(function (err, req, res, next) {
      const view = {
        api_response: 'forbidden request',
        execution_time: { ms: end() },
      }
      console.log('err: ' + req.url)

      res.locals.message = err.message
      res.locals.error = req.app.get('env') === 'development' ? err : {}
      res.type('application/json')
      res.json(view)
    })

  // All workers use this port
  app.listen(process.env.PORT || 3000)
}
