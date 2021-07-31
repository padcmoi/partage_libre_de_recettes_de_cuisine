const { Misc, Db } = require('../../../../middleware/index')

module.exports = class RecipeFoodsTypes {
  constructor() {
    this.food_list = []
  }

  /**
   *
   *
   * @returns {String}
   */
  async add() {
    const food = '__unittest_@' + Misc.getRandomStr(15)

    this.food_list.push(food)

    await Db.commit({
      query: 'INSERT INTO `foods_types_list` SET ?',
      preparedStatement: [{ food }],
    })

    return food
  }

  /**
   *
   *
   * @param {String} slug
   * @param {String} food
   *
   * @void
   */
  async use(slug, food) {
    await Db.commit({
      query: 'INSERT INTO `foods_types` SET ?',
      preparedStatement: [{ slug, food }],
    })
  }

  /**
   *
   *
   * @void
   */
  async removeAll() {
    await Db.delete({
      query: "DELETE FROM `foods_types` WHERE food LIKE '__unittest_@%'",
    })
    await Db.delete({
      query: "DELETE FROM `foods_types_list` WHERE food LIKE '__unittest_@%'",
    })
  }
}
