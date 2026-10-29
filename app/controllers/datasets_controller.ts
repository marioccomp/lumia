// import type { HttpContext } from '@adonisjs/core/http'

import Dataset from '#models/dataset'
import storage from '#services/storage/index'
import { createDatasetValidator } from '#validators/dataset'
import type { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { type DuckDBConnection, DuckDBInstance } from '@duckdb/node-api'
import { stat, rm } from 'node:fs/promises'
import logger from '@adonisjs/core/services/logger'

const readers = {
  csv: 'read_csv',
  json: 'read_json_auto',
  parquet: 'read_parquet',
}

export default class DatasetsController {
  async create({ view }: HttpContext) {
    return view.render('pages/datasets/create')
  }

  async store({ auth, request, response, session }: HttpContext) {
    const { file, ...data } = await request.validateUsing(createDatasetValidator)
    let instance: DuckDBInstance | undefined
    let connection: DuckDBConnection | undefined
    let saida: string | undefined
    try {
      instance = await DuckDBInstance.create(':memory:')
      connection = await instance.connect()

      const entrada = file.tmpPath!
      const reader = readers[file.extname as keyof typeof readers]
      saida = `${file.tmpPath}.parquet`

      await connection.run(
        `COPY (SELECT * FROM ${reader}('${entrada}')) TO '${saida}' (FORMAT PARQUET)`
      )

      const describe = await connection.runAndReadAll(
        `SELECT column_name, column_type FROM (DESCRIBE SELECT * FROM read_parquet('${saida}'))`
      )

      logger.info(describe, 'Aqui eh o describe')

      const columns = describe.getRowObjectsJson().map((row) => ({
        name: String(row.column_name),
        type: String(row.column_type),
      }))

      logger.info(columns, 'Aqui sao as columns')
      const count = await connection.runAndReadAll(
        `SELECT count(*) AS total FROM read_parquet('${saida}')`
      )

      logger.info(count, 'aqui eh o count')

      const rowCount = Number(count.getRowObjectsJS()[0].total)

      const user = auth.getUserOrFail()

      const key = `${user.id}/datasets/${randomUUID()}.parquet`

      await storage.put(key, createReadStream(saida), 'application/vnd.apache.parquet')

      const { size } = await stat(saida)

      await Dataset.create({
        name: data.name,
        storageKey: key,
        description: data.description,
        sizeBytes: size,
        userId: user.id,
        originalFilename: file.clientName,
        format: file.extname!,
        visibility: data.visibility,
        schema: JSON.stringify(columns),
        rowCount: rowCount,
      })
      session.flash('success', 'Dataset enviado com sucesso')
      return response.redirect().back()
    } catch (e) {
      logger.error(e, 'erro no dataset upload')
      session.flash('error', 'Erro no upload do dataset')
      return response.redirect().back()
    } finally {
      connection?.closeSync()
      instance?.closeSync()
      // if (saida) await rm(saida, { force: true }) depois descomenta, mas quero ver o arquivo temporario gerado
    }
  }
}
