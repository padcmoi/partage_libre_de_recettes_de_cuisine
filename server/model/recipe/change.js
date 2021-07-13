const { Db, Form, Jwt, Misc } = require('../../middleware/index')
const { RecipeManager, PictureManager } = require('../../constructor/index')

module.exports = async function (access_token, params, slug) {
  const accountFromToken = await Jwt.myInformation(access_token)
  const toastMessage = []
  const response = { success: false, merge: false }

  Form.sanitizeEachData(params, ['seasons'])
  if (accountFromToken) {
    const isMyRecipe = await Misc.isMyRecipe(accountFromToken.username, slug)
    const isMine = isMyRecipe.isMine

    if (params.title === isMyRecipe.currentRecipe.title) {
      delete params.title
    }

    const required = RecipeManager.makeRequired(params)
    const recipeManager = new RecipeManager(params, required)
    const processData = await recipeManager.result()

    // Accepted data
    if (processData.failProcess.length === 0 && accountFromToken.id && isMine) {
      Db.withTransaction()
      // prochaine requete SQL en transaction

      const merge = await Db.merge({
        query: 'UPDATE recipes SET ? WHERE ? AND ? LIMIT 1',
        preparedStatement: [
          // SET
          processData.dataProcessed,
          // WHERE
          { created_by: accountFromToken.username },
          { slug },
        ],
      })

      response.success = true
      response.merge = merge > 0 || false
      response.failProcess = processData.failProcess
      response.slug = processData.dataProcessed.slug
      response.title = processData.dataProcessed.title

      if (response.merge) {
        const pictureManager = new PictureManager(response.slug)
        await pictureManager.renameSpace(slug)

        toastMessage.push({
          type: 'success',
          msg: `Modification de la recette ${isMyRecipe.currentRecipe.title}`,
        })
      } else {
        toastMessage.push({
          type: 'warning',
          msg: `Aucun changement pour la recette ${isMyRecipe.currentRecipe.title}`,
        })
      }
    } else if (!isMine) {
      toastMessage.push({
        type: 'error',
        msg: 'Cette recette ne vous appartient pas !',
      })
    }
    // Refused data
    else {
      for (const msg of processData.toastMessage) {
        toastMessage.push({ type: 'error', msg })
      }

      response.failProcess = processData.failProcess
    }
  } else {
    // Refused access

    // Bad Jwt Access
    if (!accountFromToken) {
      toastMessage.push({
        type: 'error',
        msg: "Vous n'êtes pas correctement identifié",
      })
    }
  }

  return Object.assign(response, { toastMessage })
}
