const { Csrf, View } = require('../middleware/index')
const modelRecipe = require('../model/recipe')

const express = require('express')
const router = express.Router()
const csurf = require('csurf')({ cookie: true })

router
  .get('/', async function (req, res, next) {
    const msg = 'its HelloWorld'
    console.log(msg)
    View.json(res, { msg })
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
