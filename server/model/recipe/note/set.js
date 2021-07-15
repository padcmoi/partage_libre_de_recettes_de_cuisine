const { Db, Jwt, Misc } = require('../../../middleware/index')

module.exports = async function (_req) {
  let access_token = _req.query['access_token'] || '',
    slug = _req.params.slug || '',
    note = _req.params.note || 0

  const accountFromToken = await Jwt.myInformation(access_token)
  const response = { success: false, toastMessage: [] }

  // Définit les valeurs limites
  note = parseInt(note)
  note = note > 1 ? 1 : note < -1 ? -1 : note

  if (isNaN(note)) {
    response.toastMessage.push({
      type: 'error',
      msg: 'Erreur interne, valeur non numérique',
    })
  } else if (accountFromToken) {
    const created_by = accountFromToken.username

    // Verifie si le slug existe
    if (await Misc.isSlugExist(slug)) {
      const currentENote = await Misc.currentEvaluateNote(slug, created_by)

      if (currentENote.noteExist) {
        await Db.merge({
          query: 'UPDATE `recipes_evaluate` SET ? WHERE ? AND ? AND ? LIMIT 1',
          preparedStatement: [
            //SET
            { note },
            // WHERE
            { note: currentENote.currentNote },
            { slug },
            { created_by },
          ],
        })
      } else {
        await Db.commit({
          query: 'INSERT INTO `recipes_evaluate` SET ?',
          preparedStatement: [{ note, slug, created_by }],
        })
      }

      response.global = await Misc.globalEvaluateNote(slug)
      Object.assign(response.global, { slug })

      response.success = true
    } else {
      response.toastMessage.push({
        type: 'error',
        msg: "Cette recette n'est plus accessible ou a été supprimé !",
      })
    }
  } else {
    response.toastMessage.push({
      type: 'error',
      msg: "Vous n'êtes pas correctement identifié",
    })
  }

  return response
}
