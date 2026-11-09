import type { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from 'node:crypto'
import { createReadStream } from 'node:fs'
import storage from '#services/storage/index'
import { updateChannelValidator } from '#validators/user'
import db from '@adonisjs/lucid/services/db'
import ChannelLink from '#models/channel_link'

export default class ChannelController {
  async me({ auth, view }: HttpContext) {
    const channelUser = auth.getUserOrFail()
    
    await channelUser.load('links', (query) => {
      query.orderBy('position', 'asc')
    })

    return view.render('pages/channels/show', {
      channelUser,
      isOwner: true,
      avatarUrl: channelUser.avatarKey ? storage.url(channelUser.avatarKey): null,
      coverUrl: channelUser.coverKey ? storage.url(channelUser.coverKey) : null,
    })
  }

  async edit({auth, view}: HttpContext){
    const channelUser = auth.getUserOrFail()

    await channelUser.load('links', (query) => {
      query.orderBy('position', 'asc')
    })

    return view.render('pages/channels/edit', {
      channelUser, 
      avatarUrl: channelUser.avatarKey ? storage.url(channelUser.avatarKey): null,
      coverUrl: channelUser.coverKey ? storage.url(channelUser.coverKey) : null,
    })
  }

  async update({ auth, request, response, session }: HttpContext) {
  const channelUser = auth.getUserOrFail()

  const { avatar, cover, links, ...payload } = await request.validateUsing(
  updateChannelValidator,
  { meta: { userId: channelUser.id } }
)

  const newKeys: string[] = []
  const oldKeys: string[] = []

  const images = [
    { file: avatar, attribute: 'avatarKey', directory: 'avatars' },
    { file: cover, attribute: 'coverKey', directory: 'covers' },
  ] as const

  try {
    channelUser.merge(payload)

    for (const { file, attribute, directory } of images) {
      if (!file) continue

      if (!file.tmpPath || !file.extname || !file.type || !file.subtype) {
        throw new Error('Não foi possível processar a imagem enviada.')
      }

      const key = `${channelUser.id}/${directory}/${randomUUID()}.${file.extname}`
      newKeys.push(key)

      await storage.put(
        key,
        createReadStream(file.tmpPath),
        `${file.type}/${file.subtype}`
      )

      const oldKey = channelUser[attribute]
      if (oldKey) oldKeys.push(oldKey)

      channelUser[attribute] = key
    }

    await db.transaction(async (trx) => {
  channelUser.useTransaction(trx)
  await channelUser.save()

  await ChannelLink.query({ client: trx })
    .where('userId', channelUser.id)
    .delete()

  if (links?.length) {
    const linkTitles = {
      site: 'Site',
      linkedin: 'LinkedIn',
      github: 'GitHub',
      instagram: 'Instagram',
      youtube: 'YouTube',
      outro: 'Outro',
    }

    await ChannelLink.createMany(
      links.map((link, position) => ({
        ...link,
        title:
          link.type === 'outro'
            ? (link.title ?? 'Outro')
            : linkTitles[link.type],
        userId: channelUser.id,
        position,
      })),
      { client: trx }
    )
  }
  })
  } catch (error) {
    await Promise.allSettled(newKeys.map((key) => storage.delete(key)))
    throw error
  }

  await Promise.allSettled(oldKeys.map((key) => storage.delete(key)))

  session.flash('success', 'Perfil atualizado com sucesso.')
  return response.redirect().toRoute('channels.me')
}
}