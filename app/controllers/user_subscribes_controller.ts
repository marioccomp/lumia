// import type { HttpContext } from '@adonisjs/core/http'

import UserSubscribe from '#models/user_subscribe'
import type { HttpContext } from '@adonisjs/core/http'

export default class UserSubscribesController {
  async subscribe({ auth, params, response }: HttpContext) {
    const channelId = params.id
    const subscriberId = auth.getUserOrFail().id

    const subscription = await UserSubscribe.firstOrCreate({
      channelId,
      subscriberId,
    })

    response.status(201).json({
      message: 'Inscrição criada com sucesso',
    })
  }

  async unsubscribe({ auth, params, response }: HttpContext) {
    const channelId = params.id
    const subscriberId = auth.getUserOrFail().id

    const subscription = await UserSubscribe.query()
      .where('channel_id', channelId)
      .where('subscriber_id', subscriberId)
      .first()

    subscription ? await subscription.delete() : ''

    response.noContent()
  }
}
