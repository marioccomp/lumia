// import type { HttpContext } from '@adonisjs/core/http'

import Comment from '#models/comment'
import Video from '#models/video'
import { createCommentValidator } from '#validators/comment'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'

export default class CommentsController {
  async create({ request, auth, params, session, response }: HttpContext) {
    logger.info('Entrou em criar comentario')
    const payload = await request.validateUsing(createCommentValidator)
    const videoId = params.id
    const user = auth.getUserOrFail()

    const comment = await Comment.create({
      text: payload.text,
      videoId: videoId,
      userId: user.id,
    })

    session.flash('success', 'Comentario criado com sucesso')
    return response.redirect().back()
  }

  async update({ request, session, auth, params }: HttpContext) {
    const payload = await request.validateUsing(createCommentValidator)
    const commentId = params.commentId
    const user = auth.getUserOrFail()

    const comment = await Comment.query()
      .where('id', commentId)
      .where('user_id', user.id)
      .firstOrFail()

    comment.merge(payload)

    await comment.save()

    session.flash('success', 'Video editado com sucesso')
  }

  async delete({ response, session, auth, params }: HttpContext) {
    const commentId = params.commentId
    const user = auth.getUserOrFail()

    const comment = await Comment.query()
      .where('id', commentId)
      .where('user_id', user.id)
      .firstOrFail()

    await comment.delete()

    session.flash('success', 'Video deletado com sucesso')
    return response.redirect().back()
  }
}
