import { VideoSchema } from '#database/schema'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import User from '#models/user'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import View from './view.ts'
import Comment from './comment.ts'

export default class Video extends VideoSchema {
  @belongsTo(() => User) declare user: BelongsTo<typeof User>
  @hasMany(() => View) declare views: HasMany<typeof View>
  @hasMany(() => Comment) declare comments: HasMany<typeof Comment>
}
