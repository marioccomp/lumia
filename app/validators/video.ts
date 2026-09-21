import vine from '@vinejs/vine'

export const videoValidator = vine.create({
  title: vine.string().trim().minLength(3).maxLength(50),
  description: vine.string().trim().maxLength(250).optional(),
})
