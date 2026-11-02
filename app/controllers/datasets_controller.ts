// import type { HttpContext } from '@adonisjs/core/http'

import Dataset from '#models/dataset'
import storage from '#services/storage/index'
import { createDatasetValidator } from '#validators/dataset'
import type { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from 'node:crypto'
import { createReadStream, createWriteStream } from 'node:fs'
import { type DuckDBConnection, DuckDBInstance, StatementType } from '@duckdb/node-api'
import { stat, rm, mkdir } from 'node:fs/promises'
import logger from '@adonisjs/core/services/logger'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import app from '@adonisjs/core/services/app'
import { executeQueryValidator } from '#validators/query'

const readers = {
  csv: 'read_csv',
  json: 'read_json_auto',
  parquet: 'read_parquet',
}

export default class DatasetsController {
  async create({ view }: HttpContext) {
    return view.render('pages/datasets/create')
  }

  async show({ view, params }: HttpContext) {
    const dataset = await Dataset.findOrFail(params.id)
    return view.render('pages/datasets/show', { dataset })
  }

  async list({ view }: HttpContext) {
    const datasets = await Dataset.query().where('visibility', 'public')

    return view.render('pages/datasets/list', { datasets: datasets })
  }

  async execute({ request, session, params, response }: HttpContext) {
    const id = params.id

    const { query } = await request.validateUsing(executeQueryValidator)

    const dataset = await Dataset.findOrFail(id)

    await mkdir(app.tmpPath('datasets'), { recursive: true })

    const tmp = path.join(app.tmpPath('datasets'), `${randomUUID()}.parquet`)
    await pipeline(await storage.getStream(dataset.storageKey), createWriteStream(tmp))
    let instance: DuckDBInstance | undefined
    let connection: DuckDBConnection | undefined

    try {
      instance = await DuckDBInstance.create()
      connection = await instance.connect()

      await connection.run(`CREATE TABLE dataset AS SELECT * FROM read_parquet('${tmp}')`)

      const extracted = await connection.extractStatements(query)

      if (extracted.count !== 1) {
        return response.badRequest({ error: 'Envie apenas um comando por vez' })
      }

      const prepared = await extracted.prepare(0)

      if (prepared.statementType !== StatementType.SELECT) {
        return response.badRequest({ error: 'Apenas consultas SELECT são permitidas' })
      }

      await connection.run('SET enable_external_access = false')
      await connection.run('SET lock_configuration = true')

      const result = await connection.runAndReadAll(query)

      const rows = result.getRowsJson()
      const columns = result.columnNames()
      logger.info(rows, 'linhas retornadas')
      return response.status(200).json({
        rows,
        columns,
      })
    } catch (e) {
      logger.error(e, 'Erro na execucao da query')
      return response.badRequest({ e })
    } finally {
      connection?.closeSync()
      instance?.closeSync()
      await rm(tmp, { force: true })
    }
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
