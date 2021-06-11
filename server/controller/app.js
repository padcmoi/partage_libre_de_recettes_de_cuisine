const { Csrf, View } = require('../middleware/index')
const modelApp = require('../model/app')

const express = require('express')
const router = express.Router()

router

  .get('/settings', async function (req, res, next) {
    const view = await modelApp.getSettings()

    View.json(res, view)
  })

  .put('/settings', async function (req, res, next) {
    // todo
    if (!(await Csrf.isValidHeader(req, res))) return

    const params = {
      todo: req.body.params.todo || null,
    }
  })

module.exports = router
