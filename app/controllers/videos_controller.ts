import type { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from 'node:crypto'
import storage from '#services/storage/index'
import { videoValidator } from '#validators/video'
import path from 'node:path'
import Video from '#models/video'

export default class VideosController {
  async create({ view }: HttpContext) {
    // return view.render('pages/auth/login')
  }

  async store({ request, auth, response, session }: HttpContext) {
    let key: string | undefined

    request.multipart.onFile(
      'video',
      { size: '500mb', extnames: ['mp4', 'mov', 'webm'] },
      async (part, reporter) => {
        part.pause()
        part.on('data', reporter)
        key = `videos/${randomUUID()}${path.extname(part.file.clientName).toLowerCase()}`

        await storage.put(key, part)
      }
    )
    try {
      await request.multipart.process()

      const data = await request.validateUsing(videoValidator)
      const user = auth.getUserOrFail()
      const file = request.file('video')
      if (!key || !file || !file.isValid) {
        key ? await storage.delete(key) : ''
        return response.badRequest({
          message: key ? 'Arquivo invalido' : 'Caminho invalido',
          fileErrors: file ? file.errors : null,
        })
      }

      await Video.create({
        title: data.title,
        description: data.description,
        userId: user.id,
        storageKey: key,
      })

      session.flash('success', 'Video criado com sucesso')
      return response.redirect().toRoute('home')
    } catch (e) {
      key ? await storage.delete(key) : ''
      throw e
    }
  }
}
