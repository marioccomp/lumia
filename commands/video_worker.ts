import { Queue, Worker } from 'bullmq'
import { redisOptions } from '#services/redis'

export const VIDEO_WORKER = new Worker('video-processing', async (job) => {}, {
  connection: redisOptions,
})
