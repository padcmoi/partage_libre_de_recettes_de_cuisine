const { Csrf, View } = require('../middleware/index')
const modelRecipe = require('../model/recipe')

const express = require('express')
const router = express.Router()
const csurf = require('csurf')({ cookie: true })

router
  // GET
  .get('/', async function (req, res, next) {
    View.json(res, await modelRecipe.list(req))
  })
  .get('/:slug', async function (req, res, next) {
    View.json(res, await modelRecipe.view(req))
  })
  .get('/misc/form', csurf, async function (req, res, next) {
    View.json(res, await modelRecipe.misc.form(req))
  })
  .get('/note/:slug', async function (req, res, next) {
    View.json(res, await modelRecipe.note.get(req))
  })

  // POST
  .post('/', async function (req, res, next) {
    if (!(await Csrf.isValidHeader(req, res))) return
    View.json(res, await modelRecipe.create(req))
  })
  .post('/favorite/:slug', async function (req, res, next) {
    if (!(await Csrf.isValidHeader(req, res))) return
    View.json(res, await modelRecipe.favorite.add(req))
  })
  .post('/comment/:slug', async function (req, res, next) {
    if (!(await Csrf.isValidHeader(req, res))) return
    View.json(res, await modelRecipe.comment.post(req))
  })
  .post('/instruction/:slug/:position', async function (req, res, next) {
    if (!(await Csrf.isValidHeader(req, res))) return
    View.json(res, {
      success: true,
      instructionById: 0,
      toastMessage: [{ msg: 'msg' }],
      recipesInstructions: [
        { num_step: 0, instruction: 'message_1' },
        { num_step: 1, instruction: 'message_2' },
        { num_step: 2, instruction: 'message_3' },
      ],
    })
  })

  // PUT
  .put('/:slug', async function (req, res, next) {
    if (!(await Csrf.isValidHeader(req, res))) return
    View.json(res, await modelRecipe.change(req))
  })
  .put('/note/:slug/:note', async function (req, res, next) {
    View.json(res, await modelRecipe.note.set(req))
  })
  .put('/comment/:slug/:id', async function (req, res, next) {
    if (!(await Csrf.isValidHeader(req, res))) return
    View.json(res, await modelRecipe.comment.change(req))
  })
  .put('/instruction/:slug/:position', async function (req, res, next) {
    if (!(await Csrf.isValidHeader(req, res))) return
    View.json(res, {
      success: true,
      instructionById: 0,
      toastMessage: [{ msg: 'msg' }],
      recipesInstructions: [
        { num_step: 0, instruction: 'message_1' },
        { num_step: 1, instruction: 'message_2' },
        { num_step: 2, instruction: 'message_3' },
      ],
    })
  })
  .put(
    '/instruction/:slug/position/:old/:new',
    async function (req, res, next) {
      if (!(await Csrf.isValidHeader(req, res))) return
      View.json(res, {
        success: true,
        instructionById: 0,
        toastMessage: [{ msg: 'msg' }],
        recipesInstructions: [
          { num_step: 0, instruction: 'Mettre du poivre', picture: null },
          { num_step: 1, instruction: 'message_1' },
          { num_step: 2, instruction: 'message_2' },
          { num_step: 3, instruction: 'message_3' },
        ],
      })
    }
  )

  // DELETE
  .delete('/:slug', async function (req, res, next) {
    if (!(await Csrf.isValidHeader(req, res))) return
    View.json(res, await modelRecipe.delete(req))
  })
  .delete('/favorite/:slug', async function (req, res, next) {
    if (!(await Csrf.isValidHeader(req, res))) return
    View.json(res, await modelRecipe.favorite.remove(req))
  })
  .delete('/comment/:slug/:id', async function (req, res, next) {
    if (!(await Csrf.isValidHeader(req, res))) return
    View.json(res, await modelRecipe.comment.delete(req))
  })
  .delete('/instruction/:slug/:position', async function (req, res, next) {
    if (!(await Csrf.isValidHeader(req, res))) return
    View.json(res, {
      success: true,
      toastMessage: [{ msg: 'msg' }],
    })
  })

module.exports = router
