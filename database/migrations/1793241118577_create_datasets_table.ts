import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'datasets'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('storage_key').notNullable().unique()
      table.string('name').notNullable()
      table.integer('user_id').references('id').inTable('users').onDelete('CASCADE').notNullable()
      table.bigInteger('size_bytes').notNullable()
      table.string('original_filename').notNullable()
      table.string('format').notNullable()
      table.enum('visibility', ['public', 'private']).defaultTo('public').notNullable()
      table.text('description')
      table.integer('downloads_count').defaultTo(0).notNullable()
      table.integer('row_count')
      table.json('schema')

      table.index(['user_id'])

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
