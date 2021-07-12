const { Db, Jwt, Misc } = require('../../../middleware/index')
// const modelRecipe = require('../model/recipe')
//  const modelPicture = require('../model/picture')

module.exports = async function (req) {
  let response = { success: false, toastMessage: [] }

  const access_token = req.query['access_token'] || ''
  const slug = req.params.slug || ''

  const accountFromToken = await Jwt.myInformation(access_token)

  // if (!accountFromToken) {
  //   let maxPictures = await Misc.getMaxUploads('padcmoi')
  if (accountFromToken) {
    let maxPictures = await Misc.getMaxUploads(accountFromToken.username)

    let loadPictures = await Db.get({
      query:
        'SELECT picture, num_step FROM `recipes_pictures` WHERE `slug` = ? ORDER BY `num_step` ASC',
      preparedStatement: [slug],
    })

    const pictures = []
    let maxIndex = 0
    for (let i = 0; i < maxPictures; i++) {
      pictures.push({ picture: '', num_step: i })
    }

    for (const picture of loadPictures) {
      const num_step = picture.num_step

      maxIndex = num_step + 1
      pictures[num_step] = picture
    }

    if (maxIndex >= maxPictures) maxIndex = maxPictures - 1

    return Object.assign(response, { slug, maxPictures, maxIndex, pictures })
  } else {
    response.toastMessage.push({
      type: 'error',
      msg: "Vous n'êtes pas correctement identifié",
    })

    return response
  }
}
