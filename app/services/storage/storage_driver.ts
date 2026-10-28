import type { Readable } from 'node:stream'

export interface StorageDriver {
  put(key: string, stream: Readable, contentType?: string): Promise<void>
  delete(key: string): Promise<void>
  url(key: string): string
  getStream(key: string): Promise<Readable>
  
}
