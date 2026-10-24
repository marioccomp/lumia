import env from '#start/env'
import type { StorageDriver } from './storage_driver.ts'
import LocalStorage from './local_storage.ts'
import { AzureBlobStorage } from './azure_blob_storage.ts'

const STORAGE_DRIVER = env.get('STORAGE_DRIVER')

function createStorage(): StorageDriver {
  switch (STORAGE_DRIVER) {
    case 'local':
      return new LocalStorage()
    case 'azure':
      const connectionString = env.get('AZURE_STORAGE_CONNECTION_STRING')
      const container = env.get('AZURE_STORAGE_CONTAINER')
      if (!connectionString || !container) {
        throw new Error(
          'STORAGE_DRIVER=azure exige AZURE_STORAGE_CONNECTION_STRING e AZURE_STORAGE_CONTAINER'
        )
      }
      return new AzureBlobStorage(connectionString, container)
  }
}

export default createStorage()
