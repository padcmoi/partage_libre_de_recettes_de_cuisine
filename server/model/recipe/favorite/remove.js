const { Db, Jwt, Misc } = require('../../../middleware/index')

module.exports = async function (_req) {
  let access_token = _req.query['access_token'] || '',
    slug = _req.params.slug || ''

  let data, mustExist, slugExist

  const accountFromToken = await Jwt.myInformation(access_token)
  const response = { success: false, toastMessage: [] }

  if (accountFromToken) {
    const created_by = accountFromToken.username

    // Verifie si le favori existe
    data = await Db.get({
      query:
        'SELECT `id_favorite` FROM `recipes_favorite` WHERE ? AND ? LIMIT 1',
      preparedStatement: [{ slug }, { created_by }],
    })
    mustExist = data && data[0] ? true : false

    // Verifie si le slug existe
    slugExist = await Misc.isSlugExist(slug)

    // Verdict
    if (slugExist && mustExist) {
      await Db.delete({
        query:
          'DELETE FROM `recipes_favorite` WHERE slug = ? AND created_by = ? LIMIT 1',
        preparedStatement: [slug, created_by],
      })

      response.toastMessage.push({
        type: 'success',
        msg: 'Recette supprimée de vos favoris',
      })
      response.success = true
    } else if (!mustExist) {
      response.toastMessage.push({
        type: 'warning',
        msg: "Cette recette n'est pas dans vos favoris",
      })
    } else if (!slugExist) {
      response.toastMessage.push({
        type: 'error',
        msg: "Cette recette n'existe pas",
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
