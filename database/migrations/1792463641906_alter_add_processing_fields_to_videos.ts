import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'videos'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('progress').notNullable().defaultTo(0).checkBetween([0, 100])
      ;(table.text('error').nullable(), table.string('processed_key').nullable())
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumns('progress', 'error', 'processed_key')
    })
  }
}
