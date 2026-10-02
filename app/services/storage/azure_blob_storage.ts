import { BlobServiceClient, ContainerClient } from '@azure/storage-blob'
import type { StorageDriver } from './storage_driver.js'
import { PassThrough, pipeline, Readable } from 'node:stream'

export class AzureBlobStorage implements StorageDriver {
  #container: ContainerClient

  constructor(connectionString: string, containerName: string) {
    this.#container =
      BlobServiceClient.fromConnectionString(connectionString).getContainerClient(containerName)
  }

  async put(key: string, stream: Readable, contentType = 'video/mp4') {
    const body = new PassThrough()
    console.log('[azure] put iniciado', key)
    pipeline(stream, body, () => {})
    const blob = this.#container.getBlockBlobClient(key)
    let bytes = 0
    await blob
      .uploadStream(body, 4 * 1024 * 1024, 5, {
        blobHTTPHeaders: { blobContentType: contentType },
        onProgress: (p) => console.log('[azure] enviado', p.loadedBytes, 'lidos', bytes),
      })
      .then(() => console.log('[azure] concluído'))
  }

  async delete(key: string) {
    await this.#container.getBlockBlobClient(key).deleteIfExists()
  }

  url(key: string) {
    return this.#container.getBlockBlobClient(key).url
  }
}
