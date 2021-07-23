const { Form, Db, Jwt, Misc, Settings } = require('../../../middleware/index')

module.exports = async (req) => {
  const access_token = req.query['access_token'] || ''
  const slug = req.params.slug || ''
  const num_step = parseInt(req.params.position) || 0

  const response = { success: false, toastMessage: [] }

  const accountFromToken = await Jwt.myInformation(access_token)

  if (accountFromToken) {
    const isMyRecipe = await Misc.isMyRecipe(accountFromToken.username, slug)
    const isMine = isMyRecipe.isMine

    // Verifie si le slug existe
    if ((await Misc.isSlugExist(slug)) && isMine) {
      await Db.delete({
        query: 'DELETE FROM `recipes_instructions` WHERE ? AND ? LIMIT 1',
        preparedStatement: [{ slug }, { num_step }],
      })

      response.recipesInstructions = await Misc.instruction.reorganize(slug)

      response.toastMessage.push({
        type: 'success',
        msg: `Instruction a été supprimé`,
      })
      response.success = true
    } else if (!isMine) {
      toastMessage.push({
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

  return response
}
