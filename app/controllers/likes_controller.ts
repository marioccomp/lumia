import Like from '#models/like'
import { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'

export default class LikesController {
  async store({ response, auth, params }: HttpContext) {
    const user = auth.getUserOrFail()

    const videoId = params.id

    logger.info(`usuario ${user.fullName} dando like no video id ${videoId}`)

    const like = await Like.firstOrCreate({
      userId: user.id,
      videoId: videoId,
    })

    return response.status(201).json({
      message: 'Like criado com sucesso',
    })
  }

  async delete({ response, auth, params }: HttpContext) {
    const user = auth.getUserOrFail()

    const videoId = params.id

    logger.info(`usuario ${user.fullName} deletando like no video id ${videoId}`)

    const like = await Like.query()
      .where('video_id', videoId)
      .where('user_id', user.id)
      .firstOrFail()

    await like.delete()
    return response.noContent()
  }
}
