import { VideoSchema } from '#database/schema'
import { belongsTo, hasMany } from '@adonisjs/lucid/orm'
import User from '#models/user'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import View from './view.ts'

export default class Video extends VideoSchema {
  @belongsTo(() => User) declare user: BelongsTo<typeof User>
  @hasMany(() => View) declare views: HasMany<typeof View>
}
