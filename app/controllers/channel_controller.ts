import type { HttpContext } from '@adonisjs/core/http'

export default class ChannelController {
  async me({ auth, view }: HttpContext) {
    const channelUser = auth.getUserOrFail()

    return view.render('pages/channels/show', {
      channelUser,
      isOwner: true,
    })
  }
}