import { startMongo } from './index'

async function main() {
  const args =  process.argv.splice(2)
  const mongoserver = await startMongo({ args })
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
