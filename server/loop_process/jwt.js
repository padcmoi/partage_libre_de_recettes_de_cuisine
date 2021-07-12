const Db = require('../middleware/js/db')

module.exports = class JwtProcessLoop {
  constructor() {
    this.process()
  }

  /**
   * Pour respecter les await dans l'ordre
   * ici une methode donc pas obligatoire
   *
   * @void
   */
  async process() {
    await this.databasePurge()
  }

  /**
   * Vérifie les validités de tous les jetons
   * et purge les jetons jwt trop ancien
   *
   * @void
   */
  async databasePurge() {
    let perf_start = new Date().getTime()

    const affected_row = await Db.delete({
      query:
        'DELETE FROM `jwt` ' +
        'WHERE TIME_TO_SEC( TIMEDIFF(CURRENT_TIMESTAMP() , `expire_at`) ) > 0 AND `is_revoke` = 0',
    })

    let perf_end = new Date().getTime()
    let perf_result = perf_end - perf_start
    perf_result /= 1000

    if (affected_row > 0) {
      console.log(
        `${affected_row} jeton(s) jwt obsolète(s) supprimé(s) en ${perf_result} seconde(s)`
      )
    }
  }
}
