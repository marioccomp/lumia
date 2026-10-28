// import type { HttpContext } from '@adonisjs/core/http'

import Video from '#models/video'
import storage from '#services/storage/index'
import cache from '@adonisjs/cache/services/main'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import listVideos from '#services/videos/list_videos'

export default class HomeController {
  async show({ view }: HttpContext) {
    const videos = await cache.getOrSet({
      key: 'home:videos',
      ttl: '5m',
      factory: async () => {
        const rows = await listVideos({
          filters: { status: 'ready', visibility: 'public' },
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
}
