const path = require('path')

const UPLOAD_FOLDER = process.env.UPLOAD_FOLDER || 'files_uploads'

const staticFolder = {
  root: path.join(__dirname, '../../' + UPLOAD_FOLDER + '/'),
}
const { end } = require('../../app/perf')

const json = function (res, view) {
  view.execution_time = { ms: end() }
  res.type('application/json')
  // res.json(JSON.stringify(view))
  res.json(view)
}

const sendfile = function (res, file) {
  res.sendFile(file, staticFolder)
}

module.exports = { json, sendfile }
