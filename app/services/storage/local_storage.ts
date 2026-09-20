import app from '@adonisjs/core/services/app'
import type { StorageDriver } from './storage_driver.js'
import path from 'node:path'
import type { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { mkdir, rm } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'

export default class LocalStorage implements StorageDriver {
  private baseDir = app.makePath('storage')

  private resolve(key: string): string {
    const absolutePath = path.resolve(this.baseDir, key)
    if (!absolutePath.startsWith(this.baseDir + path.sep)) {
      throw new Error('Chave invalida')
    }
    return absolutePath
  }

  async put(key: string, stream: Readable): Promise<void> {
    const dest = this.resolve(key)
    await mkdir(path.dirname(dest), { recursive: true })
    try {
      await pipeline(stream, createWriteStream(dest))
    } catch (e) {
      await rm(dest, { force: true })
      throw e
    }
  }

  async delete(key: string): Promise<void> {
    const dest = this.resolve(key)
    await rm(dest, { force: true })
  }

  async url(key: string): Promise<string> {
    return `/media/${key}`
  }
}
