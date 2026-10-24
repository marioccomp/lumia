import emitter from '@adonisjs/core/services/emitter'
import logger from '@adonisjs/core/services/logger'

emitter.on('cache:hit', ({ key, store }) => logger.info({ key, store }, 'cache hit'))
emitter.on('cache:miss', ({ key, store }) => logger.info({ key, store }, 'cache miss'))
emitter.on('cache:deleted', ({ key }) => logger.info({ key }, 'cache deleted'))
