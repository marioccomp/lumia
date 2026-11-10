import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('username', 30).nullable().unique()
      table.text('bio').nullable()
      table.string('avatar_key').nullable()
      table.string('cover_key').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('username', 'bio', 'avatar_key', 'cover_key')
    })
  }
}
