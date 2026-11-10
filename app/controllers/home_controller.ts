// import type { HttpContext } from '@adonisjs/core/http'

import Video from '#models/video'
import storage from '#services/storage/index'
import cache from '@adonisjs/cache/services/main'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import listVideos from '#services/videos/list_videos'
import toVideoCard from '#services/videos/to_video_card'
import { DateTime } from 'luxon'

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
        return rows.map((v) => toVideoCard(v, { relativeDate: false }))
      },
    })
    logger.info(videos, 'videos encontrados com a query')
    return view.render('pages/home', {
      videos: videos.map((v) => ({
        ...v,
        postedAt: v.postedAt ? DateTime.fromISO(v.postedAt).toRelative() : '',
      })),
    })
  }
}
