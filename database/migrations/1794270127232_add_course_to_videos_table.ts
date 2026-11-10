import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * The `course` column was added to the original create_videos migration after
 * it had already run on some databases, so it may be missing. Add it only when
 * it does not exist yet.
 */
export default class extends BaseSchema {
  protected tableName = 'videos'

  async up() {
    const hasColumn = await this.schema.hasColumn(this.tableName, 'course')
    if (hasColumn) return

    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('course').defaultTo(false)
    })
  }

  async down() {}
}
