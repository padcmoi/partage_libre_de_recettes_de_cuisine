const { Csrf, View } = require('../middleware/index')
const { PictureManager } = require('../constructor/index')
const modelPicture = require('../model/picture')
const csurf = require('csurf')({ cookie: true })
const express = require('express')
const router = express.Router()

const upload = PictureManager.array

router

  .get('/:slug/:file', async function (req, res, next) {
    View.sendfile(res, await modelPicture.read(req))
  })

  .get('/misc/form/:slug', csurf, async function (req, res, next) {
    View.json(res, await modelPicture.misc.form(req))
  })

  .post('/:slug/:num_step', upload(), async function (req, res, next) {
    if (!(await Csrf.isValidHeader(req, res))) return
    View.json(res, await modelPicture.create(req))
  })

  .delete('/:slug/:num_step', async function (req, res, next) {
    if (!(await Csrf.isValidHeader(req, res))) return
    View.json(res, await modelPicture.delete(req))
  })

module.exports = router
