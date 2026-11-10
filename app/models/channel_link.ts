import { ChannelLinkSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import User from '#models/user'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class ChannelLink extends ChannelLinkSchema {
  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}