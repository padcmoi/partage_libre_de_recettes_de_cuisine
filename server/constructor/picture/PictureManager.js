const Db = require('../../middleware/js/db')
const fs = require('fs')
const makeDir = require('make-dir')
const del = require('del')
const createFile = require('create-file')
const multer = require('multer')
const md5 = require('md5')

const UPLOAD_FOLDER = process.env.UPLOAD_FOLDER || 'files_uploads'

module.exports = class PictureManager {
  constructor(currentSlug) {
    this.PRIVATE = {
      getPictures: true,
    }

    this.currentSlug = currentSlug
    this.pictures = []
  }

  /**
   * @PRIVATE
   * Récupère en base de données toutes les images
   *
   * @void
   */
  async getPictures() {
    if (this.PRIVATE.getPictures) return console.log('Private methods')
    else this.PRIVATE.getPictures = true

    const data = await Db.get({
      query: 'SELECT picture FROM `recipes_pictures` WHERE ?',
      preparedStatement: [{ slug: this.currentSlug }],
    })

    this.pictures = data
  }

  /**
   * @PUBLIC
   * Renomme un espace d'images à partir d'un slug d'origine
   *
   * @param {String} originSlug
   * @void
   */
  async renameSpace(originSlug) {
    this.PRIVATE.getPictures = false

    await this.getPictures()
    if (this.pictures.length > 0) {
      try {
        fs.renameSync(
          `./${UPLOAD_FOLDER}/${originSlug}`,
          `./${UPLOAD_FOLDER}/${this.currentSlug}`
        )
      } catch (err) {
        console.log(`./${UPLOAD_FOLDER}/${this.currentSlug} rename impossible`)
      }
    }
  }

  /**
   * @PUBLIC
   * Créer un espace pour contenir des images
   *
   * @void
   */
  async createSpace() {
    if (typeof this.currentSlug != 'string') return
    await makeDir(`./${UPLOAD_FOLDER}/${this.currentSlug}`)
  }

  /**
   * @PUBLIC
   * Supprimer un espace et TOUTES SES IMAGES
   *
   * @void
   */
  async deleteSpace() {
    if (typeof this.currentSlug != 'string') return
    del.sync([`./${UPLOAD_FOLDER}/${this.currentSlug}`])
  }

  /**
   * @STATIC
   * Configure le middleware multer
   *
   * @void
   */
  static diskStorage() {
    let storage = multer.diskStorage({
      destination: function (req, file, callback) {
        let slug = req.params.slug || ''

        callback(null, `${UPLOAD_FOLDER}/${slug}/`)
      },
      filename: function (req, file, callback) {
        let slug = req.params.slug || ''
        let step = req.params.num_step || 0
        let filename = md5(slug + step + file.originalname + Math.random())

        file.passedTest = true
        file.toastMessage = []

        switch (file.mimetype || '') {
          case 'image/png':
            callback(null, `${filename}${Date.now()}.png`)
            break
          case 'image/jpeg':
            callback(null, `${filename}${Date.now()}.jpg`)
            break
          case 'image/gif':
            callback(null, `${filename}${Date.now()}.gif`)
            break
          case 'image/webp':
            callback(null, `${filename}${Date.now()}.webp`)
            break

          default:
            file.passedTest = false
            file.toastMessage.push({
              type: 'error',
              msg: `Format ${file.mimetype} refusé`,
            })
            callback(null, file.originalname)
        }
      },
    })

    return storage
  }

  /**
   * @STATIC
   *
   * @returns {Function} milter middleware
   */
  static array() {
    let settings = {
      name: process.env.UPLOAD_NAME || 'uploadfiles',
      maxSize: parseInt(process.env.UPLOAD_API_MAX_SIZE_OCTETS) || 4096000,
    }

    const result = multer({
      storage: PictureManager.diskStorage(),
      limits: { fileSize: parseInt(settings.maxSize) },
    }).array(settings.name, 12)

    return result
  }
}
