const Db = require('../middleware/js/db')
const { PictureManager } = require('../constructor/index')

module.exports = class RecipeProcessLoop {
  constructor() {
    this.deleted = {
      space: 0,
      row: 0,
    }

    this.process()
  }

  /**
   * Pour respecter les await dans l'ordre
   * ici une methode donc pas obligatoire
   *
   * @void
   */
  async process() {
    await this.RecipeAbortedByUser()
  }

  /**
   * Vérifie les validités de tous les jetons
   * et purge les jetons csrf trop ancien
   *
   * @void
   */
  async RecipeAbortedByUser() {
    let perf_start = new Date().getTime()

    await this.spaceToDelete()
    await this.deleteRows()

    let perf_end = new Date().getTime()
    let perf_result = perf_end - perf_start
    perf_result /= 1000

    if (this.deleted.row > 0) {
      console.log(
        `${this.deleted.row} recette(s) obsolète(s) supprimé(s) en ${perf_result} seconde(s)`
      )
    }
  }

  /**
   * Supprime les dossiers des slugs et leurs contenus
   *
   * @void
   */
  async spaceToDelete() {
    const spaceToDelete = await Db.get({
      query:
        'SELECT slug FROM `recipes` WHERE TIME_TO_SEC( TIMEDIFF(CURRENT_TIMESTAMP() , `created_at`) ) > ? AND `temporary` = 1',
      preparedStatement: [
        parseInt(process.env.RECIPE_ABORTED_BY_USER_DELAY || 86400),
      ],
    })

    for (const space of spaceToDelete) {
      if (!space.slug) continue
      console.warn(space.slug)

      const pictureManager = new PictureManager(space.slug)
      await pictureManager.deleteSpace() // Effacer les eventuelles images
    }

    this.deleted.space = spaceToDelete.length
  }

  /**
   * Supprime les recettes temporaires
   *
   * @void
   */
  async deleteRows() {
    // DELETE FROM `recipes` WHERE TIME_TO_SEC( TIMEDIFF(CURRENT_TIMESTAMP() , `created_at`) ) > 60 AND `temporary` = 1

    const affected_row = await Db.delete({
      query:
        'DELETE FROM `recipes` ' +
        'WHERE TIME_TO_SEC( TIMEDIFF(CURRENT_TIMESTAMP() , `created_at`) ) > ? AND `temporary` = 1',
      preparedStatement: [
        parseInt(process.env.RECIPE_ABORTED_BY_USER_DELAY || 86400),
      ],
    })

    this.deleted.row = parseInt(affected_row)
  }
}
