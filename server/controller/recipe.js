const { Csrf, View } = require('../middleware/index')
const modelRecipe = require('../model/recipe')

const express = require('express')
const router = express.Router()

router

  .get('/', async function (req, res, next) {
    const view = { slug: 'all' }

    View.json(res, view)
  })

  .get('/:slug', async function (req, res, next) {
    const slug = req.params.slug || ''
    const query = req.query
    const view = { slug, query }
    View.json(res, view)
  })

  .post('/', async function (req, res, next) {
    if (!(await Csrf.isValidHeader(req, res))) return

    const access_token = req.query['access_token'] || ''
    const view = await modelRecipe.createRecipe(access_token, req.body.params)

    View.json(res, view)
  })

  .put('/:slug', async function (req, res, next) {
    if (!(await Csrf.isValidHeader(req, res))) return

    const access_token = req.query['access_token']
    const slug = req.params.slug || ''
    const params = {
      todo: req.body.params.todo || null,
    }

    View.json(res, {})
  })

  .delete('/:slug', async function (req, res, next) {
    if (!(await Csrf.isValidHeader(req, res))) return

    const access_token = req.query['access_token']
    const slug = req.params.slug || ''

    View.json(res, {})
  })

module.exports = router
