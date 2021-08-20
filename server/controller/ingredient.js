const { Csrf, View } = require('../middleware/index')
const modelIngredient = require('../model/ingredient')

const express = require('express')
const router = express.Router()
const csurf = require('csurf')({ cookie: true })

router
  // GET
  .get('/types', async function (req, res, next) {
    View.json(res, await modelIngredient.get.types(req))
  })
  .get('/recipe/:slug', async function (req, res, next) {
    View.json(res, await modelIngredient.get.recipe_byslug(req))
  })
  .get('/stock', async function (req, res, next) {
    View.json(res, await modelIngredient.get.stock(req))
  })
  .get('/stock/byaccount', async function (req, res, next) {
    View.json(res, await modelIngredient.get.stock_byaccount(req))
  })
  .get('/stock/bytype', async function (req, res, next) {
    View.json(res, await modelIngredient.get.stock_bytype(req))
  })

  // POST
  .post('/recipe/:slug', async function (req, res, next) {
    if (!(await Csrf.isValidHeader(req, res))) return
    View.json(res, await modelIngredient.add_to_recipe(req))
  })
  .post('/stock', async function (req, res, next) {
    if (!(await Csrf.isValidHeader(req, res))) return
    View.json(res, await modelIngredient.add_to_stock(req))
  })
  .post('/type', async function (req, res, next) {
    if (!(await Csrf.isValidHeader(req, res))) return
    View.json(res, await modelIngredient.add_type(req))
  })

  // PUT
  .put('/recipe/:slug/:id_ingredients', async function (req, res, next) {
    if (!(await Csrf.isValidHeader(req, res))) return
    View.json(res, await modelIngredient.change_to_recipe(req))
  })
  .put('/stock', async function (req, res, next) {
    if (!(await Csrf.isValidHeader(req, res))) return
    View.json(res, await modelIngredient.change_to_stock(req))
  })
  .put('/owner/stock', async function (req, res, next) {
    if (!(await Csrf.isValidHeader(req, res))) return
    View.json(res, await modelIngredient.change_owner_stock(req))
  })
  .put('/type', async function (req, res, next) {
    if (!(await Csrf.isValidHeader(req, res))) return
    View.json(res, await modelIngredient.change_type(req))
  })

  // DELETE
  .delete('/recipe/:slug/:id_ingredients', async function (req, res, next) {
    if (!(await Csrf.isValidHeader(req, res))) return
    View.json(res, await modelIngredient.delete_to_recipe(req))
  })
  .delete('/stock', async function (req, res, next) {
    if (!(await Csrf.isValidHeader(req, res))) return
    View.json(res, await modelIngredient.delete_to_stock(req))
  })
  .delete('/type', async function (req, res, next) {
    if (!(await Csrf.isValidHeader(req, res))) return
    View.json(res, await modelIngredient.delete_type(req))
  })

module.exports = router
