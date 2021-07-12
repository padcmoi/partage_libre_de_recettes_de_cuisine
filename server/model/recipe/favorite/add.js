const { Db, Jwt, Misc } = require('../../../middleware/index')

module.exports = async function (access_token, slug) {
  let data, alreadyExist, slugExist

  access_token = 'test'

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
    alreadyExist = data && data[0] ? true : false

    // Verifie si le slug existe
    slugExist = await Misc.isSlugExist(slug)

    // Verdict
    if (slugExist && !alreadyExist) {
      await Db.commit({
        query: 'INSERT INTO `recipes_favorite` SET ?',
        preparedStatement: [{ slug, created_by }],
      })

      response.toastMessage.push({
        type: 'success',
        msg: 'Recette ajoutée à vos favoris',
      })
      response.success = true
    } else if (alreadyExist) {
      response.toastMessage.push({
        type: 'warning',
        msg: 'Cette recette est déja dans vos favoris',
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
