module.exports = class ReorganizeData {
  static view(response) {
    const order = [
      'success',
      'toastMessage',
      'user_can_comment',
      'locked_comment',
      'has_favorite',
      'slug',
      'title',
      'description',
      'created_at',
      'updated_at',
      'created_by',
      'firstname',
      'lastname',
      'difficulty',
      'nutriscore',
      'preparation_time',
      'cooking_time',
      'total_time',
      'liked',
      'disliked',
      'category',
      'count_pictures',
      'pictures',
      'seasons',
      'comments',
      'recipesInstructions',
    ]
    const ReorganizedObject = {}

    for (const key of order) {
      ReorganizedObject[key] = response[key] || undefined
    }

    return Object.assign(ReorganizedObject, response)
  }
}
