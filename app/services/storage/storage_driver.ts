import { Readable } from 'node:stream'

export interface StorageDriver {
  put(key: string, stream: Readable): Promise<void>
  delete(key: string): Promise<void>
  url(key: string): Promise<string>
}
