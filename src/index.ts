import path from 'path'
import os from 'os'
import fsExtra from 'fs-extra'
import download from 'download'
import consola from 'consola'
import decompress from 'decompress'
import type { ExecaChildProcess } from 'execa'
import execa from 'execa'
import ora from 'ora'
import { onShutdown } from 'node-graceful-shutdown'
import getURL from 'mongodb-download-url'
import { mongoFormula as formula } from './formula'

export interface MongoOptions {
  name?: string
  platform?: string
  dir?: string
  port?: string | number
  args?: string[]
}

export interface MongoService {
  service: ExecaChildProcess
  close: () => Promise<void>
}

export async function startMongo (opts: MongoOptions): Promise<MongoService> {
  // Apply defaults
  opts = {
    name: process.env.MONGO_NAME || 'default',
    port: process.env.MONGO_PORT || process.env.PORT || formula.port,
    platform: process.env.MONGO_PLATFORM || process.platform,
    dir: process.env.MONGO_DIR || path.resolve(os.tmpdir(), 'mongo'),
    ...opts
  }

  // Find source
  const source = await getURL()

  // Resolve paths
  const dataDir = path.resolve(opts.dir, 'data', opts.name, formula.name)
  const logsDir = path.resolve(opts.dir, 'logs', opts.name, formula.name)
  const logFile = path.resolve(logsDir, 'logs.txt')
  const sourceDir = path.resolve(opts.dir, 'source', formula.name, formula.version, source.platform)
  const sourceFileName = `${formula.name}-${formula.version}-${source.platform}` + path.extname(source.url)
  const sourceFile = path.resolve(sourceDir, sourceFileName)
  const extractDir = path.resolve(sourceDir, 'unpacked')
  const execFile = path.resolve(extractDir, formula.exec)

  // Ensure data dir exists
  await fsExtra.mkdirp(dataDir)

  // Show a spinner
  const spinner = ora()

  // Ensure package is installed
  if (!fsExtra.existsSync(extractDir) || !fsExtra.existsSync(execFile)) {
    if (!fsExtra.existsSync(sourceFile)) {
      const dlMessage = `Downloading ${sourceFileName}`
      spinner.start(dlMessage + '...')
      const res = download(source.url, sourceDir, { filename: sourceFileName })
      res.on('downloadProgress', (e) => {
        spinner.text = `${dlMessage} | ${Math.round(e.percent * 100)}%`
      })
      await res
    }
    spinner.start(`Decompressing ${sourceFileName}...`)
    await decompress(sourceFile, extractDir, { strip: 1 })
    spinner.stop()
  }
  await fsExtra.mkdirp(logsDir)
  await fsExtra.remove(logFile)

  // Open logs file
  const logsFile = await fsExtra.open(logFile, 'w+')
  const stdout = logsFile
  const stderr = logsFile
  consola.info(`Writing logs to: ${logFile}`)

  // Port and args
  const execArgs = formula.execArgs.replace('{port}', opts.port + '').replace('{data}', dataDir).split(' ')
  if (Array.isArray(opts.args)) {
    execArgs.push(...opts.args)
  }

  // Start app
  spinner.info(`Starting ${formula.name} at port ${opts.port}`)
  const service = execa(execFile, execArgs, {
    stdout,
    stderr
  })

  const close = () => Promise.resolve(service.cancel())

  onShutdown(() => close())

  return {
    service,
    close
  }
}
