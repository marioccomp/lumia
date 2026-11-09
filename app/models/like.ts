import { LikeSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import Video from './video.ts'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Like extends LikeSchema {
  @belongsTo(() => Video) declare video: BelongsTo<typeof Video>
}
