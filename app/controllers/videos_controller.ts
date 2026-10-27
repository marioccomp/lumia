import type { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from 'node:crypto'
import storage from '#services/storage/index'
import { videoValidator, updateVideoValidator } from '#validators/video'
import logger from '@adonisjs/core/services/logger'
import path from 'node:path'
import Video from '#models/video'
import View from '#models/view'
import { DateTime } from 'luxon'
import cache from '@adonisjs/cache/services/main'
import auth from '@adonisjs/auth/services/main'
export default class VideosController {
  async create({ view }: HttpContext) {
    return view.render('pages/videos/create/index')
  }

  async store({ request, auth, response, session }: HttpContext) {
    let key: string | undefined

    const user = auth.getUserOrFail()

    request.multipart.onFile(
      'video',
      { size: '500mb', extnames: ['mp4', 'mov', 'webm'] },
      async (part, reporter) => {
        part.pause()
        part.on('data', reporter)
        key = `${user?.id}/videos/${randomUUID()}${path.extname(part.file.clientName).toLowerCase()}`

        await storage.put(key, part)
      }
    )
    try {
      await request.multipart.process()

      const data = await request.validateUsing(videoValidator)
      const file = request.file('video')
      if (!key || !file || !file.isValid) {
        key ? await storage.delete(key) : ''
        return response.badRequest({
          message: key ? 'Arquivo invalido' : 'Caminho invalido',
          fileErrors: file ? file.errors : null,
        })
      }

      const video = await Video.create({
        title: data.title,
        description: data.description,
        userId: user.id,
        storageKey: key,
        visibility: data.visibility,
      })

      if (data.visibility === 'public') {
        cache.delete({ key: 'home:videos' })
      }

      session.flash('success', 'Video criado com sucesso')
      return response.redirect().toRoute('videos.created', { id: video.id })
    } catch (e) {
      key ? await storage.delete(key) : ''
      throw e
    }
  }

  async update({ params, request, response, auth }: HttpContext) {
    console.log('entrou aq')
    const video = await Video.query()
      .where('id', params.id)
      .where('userId', auth.getUserOrFail().id)
      .firstOrFail()

    const payload = await request.validateUsing(updateVideoValidator)

    video.merge(payload)

    await video.save()

    return response.created({
      id: video.id,
    })
  }

  async created({ params, request, response, auth, view }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      const id = params.id

      const video = await Video.query().where('id', id).where('user_id', user.id).firstOrFail()

      return view.render('pages/videos/create/created', {
        video,
        videoUrl: storage.url(video.storageKey),
      })
    } catch (e) {
      throw e
    }
  }

  async show({ params, request, response, auth, view }: HttpContext) {
    try {
      const user = auth.user
      const id = params.id
      const ip = request.ip()

      const video = await Video.query().where('id', id).where('visibility', 'public').firstOrFail()

      logger.info(video.$attributes, 'Video encontrado')
      logger.info(user?.$attributes, 'User encontrado')

      const lastView = await View.query()
        .where('video_id', id)
        .where((q) => {
          q.where('ip', ip)
          if (user) q.orWhere('user_id', user.id)
        })
        .orderBy('created_at', 'desc')
        .first()

      lastView?.createdAt ? logger.info('Ja teve view aqui') : logger.info('nunca teve view')

      if (lastView?.createdAt) {
        const minutes = DateTime.now().diff(lastView.createdAt, 'minutes').minutes

        if (minutes > 5) {
          const newView = {
            ip,
            userId: user?.id ?? null,
            videoId: video.id,
          }
          await View.create(newView)
        }
      } else {
        const newView = {
          ip,
          userId: user?.id ?? null,
          videoId: video.id,
        }
        await View.create(newView)
      }

      const comments = await video
        .related('comments')
        .query()
        .preload('user')
        .orderBy('created_at', 'desc')
        .limit(20)

      return view.render('pages/videos/show', {
        video,
        videoUrl: storage.url(video.storageKey),
        comments,
      })
    } catch (e) {
      throw e
    }
  }

  async delete({ auth, request, response }: HttpContext) {
    const { id } = request.params()
    const user = auth.getUserOrFail()

    const video = await Video.query().where('id', id).where('user_id', user.id).first()

    if (!video) {
      return response.unauthorized({
        message: 'Voce nao eh o dono desse video, ou o video não existe',
      })
    }

    await storage.delete(video.storageKey)
    await video.delete()
    if (video.visibility === 'public') {
      await cache.delete({ key: 'home:videos' })
    }
    return response.noContent()
  }
}
