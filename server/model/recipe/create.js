const { Db, Form, Jwt, Settings } = require('../../middleware/index')
const { RecipeManager, PictureManager } = require('../../constructor/index')

module.exports = async function (access_token, params) {
  const accountFromToken = await Jwt.myInformation(access_token)
  const userCanCreateRecipe = await Settings.user_can_create_recipe()
  const toastMessage = []
  const response = {}

  Form.sanitizeEachData(params, ['seasons'])
  if (userCanCreateRecipe && accountFromToken) {
    const required = [
      'slugTitle',
      'description',
      'seasons',
      'difficulty',
      'nutriscore',
      'cookingTime',
      'preparationTime',
      'category',
    ]

    const recipeManager = new RecipeManager(params, required)
    const processData = await recipeManager.result()

    // Accepted data
    if (processData.failProcess.length === 0 && accountFromToken.id) {
      const insert = Object.assign(processData.dataProcessed, {
        created_by: accountFromToken.username,
      })

      Db.withTransaction() // prochaine requete SQL en transaction
      await Db.commit({
        query: 'INSERT INTO recipes SET ?',
        preparedStatement: [insert],
      })

      toastMessage.push({
        type: 'success',
        msg: `Recette ${processData.dataProcessed.title} ajouté`,
      })

      response.success = true
      response.failProcess = processData.failProcess
      response.slug = processData.dataProcessed.slug
      response.title = processData.dataProcessed.title

      // Prépare l'emplacement pour stocker les images
      const pictureManager = new PictureManager(response.slug)
      await pictureManager.deleteSpace() // Effacer les eventuelles images
      await pictureManager.createSpace() // Créer un nouvel espace
    }
    // Refused data
    else {
      for (const msg of processData.toastMessage) {
        toastMessage.push({ type: 'error', msg })
      }

      response.success = false
      response.failProcess = processData.failProcess
    }
  } else {
    // Refused access
    response.success = false

    // Bad Jwt Access
    if (!accountFromToken) {
      toastMessage.push({
        type: 'error',
        msg: "Vous n'êtes pas correctement identifié",
      })
    }
    // Recipe create disable
    if (!userCanCreateRecipe) {
      toastMessage.push({
        type: 'warning',
        msg: 'La création de recettes est indisponible',
      })
    }
  }

  return Object.assign(response, { toastMessage })
}
