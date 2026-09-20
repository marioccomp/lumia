import env from '#start/env'
import type { StorageDriver } from './storage_driver.ts'
import LocalStorage from './local_storage.ts'

const STORAGE_DRIVER = env.get('STORAGE_DRIVER')

function createStorage(): StorageDriver {
  switch (STORAGE_DRIVER) {
    case 'local':
      return new LocalStorage()
  }
}

export default createStorage()
