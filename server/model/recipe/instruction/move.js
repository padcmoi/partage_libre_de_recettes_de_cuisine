const { Form, Db, Jwt, Misc, Settings } = require('../../../middleware/index')

module.exports = async (req) => {
  const access_token = req.query['access_token'] || ''
  const slug = req.params.slug || ''
  let _old = parseInt(req.params.old) || 0
  let _new = parseInt(req.params.new) || 0

  const response = { success: false, toastMessage: [] }

  if (_old != _new) {
    const accountFromToken = await Jwt.myInformation(access_token)

    if (accountFromToken) {
      const isMyRecipe = await Misc.isMyRecipe(accountFromToken.username, slug)
      const isMine = isMyRecipe.isMine

      // Verifie si le slug existe
      if ((await Misc.isSlugExist(slug)) && isMine) {
        _old = _new <= _old ? _old + 1 : _old
        _new = _new >= _old ? _new + 1 : _new

        await Misc.instruction.insert(slug, _new)

        await Db.merge({
          query: 'UPDATE `recipes_instructions` SET ? WHERE ? AND ? LIMIT 1',
          preparedStatement: [{ num_step: _new }, { slug }, { num_step: _old }],
        })

        response.recipesInstructions = await Misc.instruction.reorganize(slug)

        response.success = true
      } else if (!isMine) {
        response.toastMessage.push({
          type: 'error',
          msg: 'Cette recette ne vous appartient pas !',
        })
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
  } else {
    response.toastMessage.push({
      type: 'error',
      msg: "L'ancienne valeur est identique à la nouvelle",
    })
  }

  return response
}
