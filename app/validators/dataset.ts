import vine from '@vinejs/vine'

export const createDatasetValidator = vine.create({
  name: vine.string().trim().maxLength(30).minLength(3),
  description: vine.string().trim().maxLength(150).optional(),
  visibility: vine.enum(['public', 'private']).optional(),
  file: vine.file({
    size: '10mb',
    extnames: ['csv', 'json', 'parquet'],
  }),
})
