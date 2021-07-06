import path from 'path'
import os from 'os'
import fsExtra from 'fs-extra'
import download from 'download'
import consola from 'consola'
import decompress from 'decompress'
import execa from 'execa'
import ora from 'ora'
import { onShutdown } from 'node-graceful-shutdown'
import { mongoFormula as formula } from './formula'

export async function startMongo (opts = { args: null }) {
  const platformName = process.platform
  let platform = formula.platforms.find(p => p.name === platformName)
  if (!platform) {
    throw new Error(`Platform '${platformName}' is not available for '${formula.name}'`)
  }

  const instanceName = 'default'
  const appDir = process.env.MONGO_DIR || path.resolve(os.tmpdir(), formula.name)

  // Resolve paths
  const dataDir = path.resolve(appDir, 'data', instanceName, formula.name)
  const logsDir = path.resolve(appDir, 'logs', instanceName, formula.name)
  const logFile = path.resolve(logsDir, 'logs.txt')
  const sourceDir = path.resolve(appDir, 'source', formula.name, formula.version, platform.name)
  const sourceFileName = `${formula.name}-${formula.version}-${platform.name}` + path.extname(platform.source)
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
      const res = download(platform.source, sourceDir, { filename: sourceFileName })
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
  let stdout, stderr
  const logsFile = await fsExtra.open(logFile, 'w+')
  stdout = stderr = logsFile
  consola.info(`Writing logs to: ${logFile}`)

  // Port and args
  const port = process.env.PORT || formula.port
  const execArgs = formula.execArgs.replace('{port}', port + '').replace('{data}', dataDir).split(' ')
  if (Array.isArray(opts.args)) {
    execArgs.push(...opts.args)
  }

  // Start app
  spinner.info(`Starting ${formula.name} at port ${port}`)
  const server = execa(execFile, execArgs, {
    stdout,
    stderr
  })

  const close = () => Promise.resolve(server.cancel())

  onShutdown(() => close())

  return {
    server,
    close
  }
}
