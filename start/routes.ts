/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import { controllers } from '#generated/controllers'
import router from '@adonisjs/core/services/router'

router.get('/', [controllers.Home, 'show']).as('home')

router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create'])
    router.post('signup', [controllers.NewAccount, 'store'])

    router.get('login', [controllers.Session, 'create'])
    router.post('login', [controllers.Session, 'store'])
  })
  .use(middleware.guest())

router
  .group(() => {
    router.post('logout', [controllers.Session, 'destroy'])
    router.get('/videos/new', [controllers.Videos, 'create'])
    router.get('/videos/new/:id', [controllers.Videos, 'created']).as('videos.created')
    router.put('/videos/:id', [controllers.Videos, 'update'])
    router.post('/videos/new', [controllers.Videos, 'store'])
    router.delete('/videos/:id', [controllers.Videos, 'delete'])
  })
  .use(middleware.auth())

router.get('/health/live', [controllers.HealthChecks, 'live'])

router
  .get('/health/ready', [controllers.HealthChecks, 'ready'])
  .use(({ request, response }, next) => {
    if (request.header('x-monitoring-secret') === 'some_secret_value') {
      return next()
    }
    return response.unauthorized({ message: 'Unauthorized access' })
  })

router
  .get('/videos/:id', [controllers.Videos, 'show'])
  .as('videos.show')
  .where('id', router.matchers.number())
