const { Csrf, View } = require('../middleware/index')
const modelRecipe = require('../model/recipe')

const express = require('express')
const router = express.Router()
const csurf = require('csurf')({ cookie: true })

router
  // GET
  .get('/', async function (req, res, next) {
    View.json(res, await modelRecipe.list(req.query))
  })
  .get('/:slug', async function (req, res, next) {
    const slug = req.params.slug || ''
    View.json(res, await modelRecipe.view(req.query, slug))
  })
  .get('/misc/form', csurf, async function (req, res, next) {
    View.json(res, await modelRecipe.misc.form(req))
  })
  .get('/note/:slug', async function (req, res, next) {
    const slug = req.params.slug || ''
    View.json(res, await modelRecipe.note.get(slug))
  })

  // POST
  .post('/', async function (req, res, next) {
    if (!(await Csrf.isValidHeader(req, res))) return
    const access_token = req.query['access_token'] || ''
    const params = req.body.params || {}
    View.json(res, await modelRecipe.create(access_token, params))
  })
  .post('/favorite/:slug', async function (req, res, next) {
    if (!(await Csrf.isValidHeader(req, res))) return
    const access_token = req.query['access_token'] || ''
    const slug = req.params.slug || ''
    View.json(res, await modelRecipe.favorite.add(access_token, slug))
  })
  .post('/comment/:slug', async function (req, res, next) {
    if (!(await Csrf.isValidHeader(req, res))) return
    View.json(res, await modelRecipe.comment.post(req))
  })

  // PUT
  .put('/:slug', async function (req, res, next) {
    if (!(await Csrf.isValidHeader(req, res))) return
    const access_token = req.query['access_token'] || ''
    const slug = req.params.slug || ''
    const params = req.body.params || {}
    View.json(res, await modelRecipe.change(access_token, params, slug))
  })
  .put('/note/:slug/:note', async function (req, res, next) {
    const access_token = req.query['access_token'] || ''
    const slug = req.params.slug || ''
    const note = req.params.note || 0
    View.json(res, await modelRecipe.note.set(access_token, slug, note))
  })
  .put('/comment/:slug/:id', async function (req, res, next) {
    if (!(await Csrf.isValidHeader(req, res))) return
    View.json(res, await modelRecipe.comment.change(req))
  })

  // DELETE
  .delete('/:slug', async function (req, res, next) {
    if (!(await Csrf.isValidHeader(req, res))) return
    const access_token = req.query['access_token'] || ''
    const slug = req.params.slug || ''
    View.json(res, await modelRecipe.delete(access_token, slug))
  })
  .delete('/favorite/:slug', async function (req, res, next) {
    if (!(await Csrf.isValidHeader(req, res))) return
    const access_token = req.query['access_token'] || ''
    const slug = req.params.slug || ''
    View.json(res, await modelRecipe.favorite.remove(access_token, slug))
  })
  .delete('/comment/:slug/:id', async function (req, res, next) {
    if (!(await Csrf.isValidHeader(req, res))) return
    View.json(res, await modelRecipe.comment.delete(req))
  })

  // DEVTEST
  .get('/test/:slug/:slug2', async function (req, res, next) {
    console.log('Controller Test params:' + req.params.slug)

    const slug = req.params.slug || ''
    const slug2 = req.params.slug2 || ''
    const params = {
      // title: 'Pizza Chorizo L\'"olive',
      // title: 'pizza cannibale',
      // title: 'pizza cannibale2',
      // title: 'pizza végétarienne',
      // title: 'pizza marguerite',
      title: slug,
      description: 'baba',
      seasons: ['spring', 'winter'],
      // seasons: ['winter', 'autumn', 'summer', 'spring'],
      difficulty: 'EaSy',
      nutriscore: 'e',
      preparation_time: 601.99,
      cooking_time: 300.12,
      category: 'Plat',
      // lock: false, // Pour ajouter des images alors on verrouille la recette
      temporary: true, // Pour ajouter des images alors on verrouille la recette
    }

    // const view = await modelRecipe.change('test', params, slug2)
    const view = await modelRecipe.create('test', params)
    // await modelRecipe.create('test', params)
    // const view = await modelRecipe.delete('test', slug)

    View.json(res, view)
  })

  .get('/disable/abc/:slug2', async function (req, res, next) {
    console.log('Controller Test params:' + req.params.slug)

    const slug2 = req.params.slug2 || ''
    const params = {
      // lock: false, // Pour ajouter des images alors on verrouille la recette
      temporary: false, // Pour ajouter des images alors on verrouille la recette
    }

    const view = await modelRecipe.change('test', params, slug2)

    View.json(res, view)
  })

module.exports = router
