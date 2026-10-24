import env from '#start/env'
import { Redis } from 'ioredis'

export const redisOptions = {
  host: env.get('REDIS_HOST'),
  port: env.get('REDIS_PORT'),
  password: env.get('REDIS_PASSWORD'),
  maxRetriesPerRequest: null,
}

export default function createRedis() {
  return new Redis(redisOptions)
}
