module.exports = {
  get: {
    recipe_byslug: require('./ingredient/get/recipe_byslug'),
    stock: require('./ingredient/get/stock'),
    stock_byaccount: require('./ingredient/get/stock_byaccount'),
    stock_bytype: require('./ingredient/get/stock_bytype'),
    types: require('./ingredient/get/types'),
  },
  add_to_recipe: require('./ingredient/add_to_recipe'),
  add_to_stock: require('./ingredient/add_to_stock'),
  add_type: require('./ingredient/add_type'),
  change_owner_stock: require('./ingredient/change_owner_stock'),
  change_to_recipe: require('./ingredient/change_to_recipe'),
  change_to_stock: require('./ingredient/change_to_stock'),
  change_type: require('./ingredient/change_type'),
  delete_to_recipe: require('./ingredient/delete_to_recipe'),
  delete_to_stock: require('./ingredient/delete_to_stock'),
  delete_type: require('./ingredient/delete_type'),
}
