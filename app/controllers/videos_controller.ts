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
import listVideos from '#services/videos/list_videos'
export default class VideosController {
  async create({ view }: HttpContext) {
    return view.render('pages/videos/create/index')
  }

  async list({ view }: HttpContext) {
    const videos = await cache.getOrSet({
      key: 'home:videos',
      ttl: '5m',
      factory: async () => {
        const rows = await listVideos({
          filters: { status: 'ready', visibility: 'public', course: false },
          withViews: true,
        })
        return rows.map((v) => ({
          id: v.id,
          title: v.title,
          views: Number(v.$extras.views_count),
          thumbnailUrl: v.thumbnailKey ? storage.url(v.thumbnailKey) : null,
          url: storage.url(v.storageKey),
        }))
      },
    })
    logger.info(videos, 'videos encontrados com a query')
    return view.render('pages/home', { videos })
  }

  async store({ request, auth, response, session }: HttpContext) {
    let key: string | undefined
    let thumbnailKey: string | undefined
    let videoSaved = false

    const thumbnailTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
    }

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

    request.multipart.onFile(
      'thumbnail',
      { size: '5mb', extnames: ['jpg', 'jpeg', 'png', 'webp'] },
      async (part, reporter) => {
        part.pause()
        part.on('data', reporter)

        const extension = path.extname(part.file.clientName).toLowerCase()

        thumbnailKey = `${user.id}/thumbnails/${randomUUID()}${extension}`

        await storage.put(
          thumbnailKey,
          part,
          thumbnailTypes[extension] ?? 'application/octet-stream'
        )
      }
    )

    try {
      await request.multipart.process()

      const data = await request.validateUsing(videoValidator)
      const file = request.file('video')
      const thumbnail = request.file('thumbnail')

      const thumbnailMimeType = thumbnail
        ? thumbnailTypes[path.extname(thumbnail.clientName).toLowerCase()]
        : undefined

      const thumbnailInvalid =
        thumbnail &&
        (!thumbnail.isValid ||
          !thumbnailKey ||
          thumbnailMimeType !== `${thumbnail.type}/${thumbnail.subtype}`)

      if (!key || !file || !file.isValid || thumbnailInvalid) {
        await Promise.allSettled([
          key ? storage.delete(key) : Promise.resolve(),
          thumbnailKey ? storage.delete(thumbnailKey) : Promise.resolve(),
        ])
        return response.badRequest({
          message: 'Arquivo de vídeo ou thumbnail inválido.',
          fileErrors: file?.errors ?? null,
          thumbnailErrors: thumbnail?.errors ?? null,
        })
      }

      const video = await Video.create({
        title: data.title,
        description: data.description,
        userId: user.id,
        storageKey: key,
        thumbnailKey: thumbnailKey ?? null,
        visibility: data.visibility,
      })

      videoSaved = true

      if (data.visibility === 'public') {
        cache.delete({ key: 'home:videos' })
      }

      session.flash('success', 'Video criado com sucesso')
      return response.redirect().toRoute('videos.created', { id: video.id })
    } catch (e) {
      if (!videoSaved) {
        await Promise.allSettled([
          key ? storage.delete(key) : Promise.resolve(),
          thumbnailKey ? storage.delete(thumbnailKey) : Promise.resolve(),
        ])
      }

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
