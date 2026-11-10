// import type { HttpContext } from '@adonisjs/core/http'

import SavedVideo from '#models/saved_video'
import Video from '#models/video'
import type { HttpContext } from '@adonisjs/core/http'

export default class SavedVideosController {
  async list({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const id = Number(params.id)

    if (user.id !== id) {
      response.unauthorized({
        message: 'Você não tem permissão para visualizar isso',
      })
    }

    const videos = await Video.query().whereIn(
      'id',
      SavedVideo.query().select('videoId').where('user_id', id)
    )

    return videos
  }
}
