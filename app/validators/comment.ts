import vine from '@vinejs/vine'

export const createCommentValidator = vine.create({
  text: vine.string().trim(),
})
