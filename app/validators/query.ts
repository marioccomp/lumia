import vine from '@vinejs/vine'

export const executeQueryValidator = vine.create({
  query: vine.string().trim(),
})
