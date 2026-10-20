import { Queue } from 'bullmq'
import { redisOptions } from '#services/redis'

export const VIDEO_QUEUE = 'video-processing'

export const PROCESS_VIDEO_JOB = 'process'

export type VideoJobData = { videoId: number }

const videoQueue = new Queue<VideoJobData>(VIDEO_QUEUE, {
  connection: redisOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
})

export function enqueueVideo(videoId: number) {
  return videoQueue.add(
    PROCESS_VIDEO_JOB,
    { videoId },
    {
      jobId: `video-${videoId}`,
    }
  )
}

export function closeVideoQueue() {
  return videoQueue.close()
}
