// import type { HttpContext } from '@adonisjs/core/http'

import Video from '#models/video'
import type { HttpContext } from '@adonisjs/core/http'

export default class HomeController {
  async show({ view }: HttpContext) {
    const videos = await Video.query().where('status', 'ready')
    return view.render('pages/home', { videos })
  }
}
