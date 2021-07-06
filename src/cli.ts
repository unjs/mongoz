import { startMongo } from './index'

async function main () {
  const args = process.argv.splice(2)
  await startMongo({ args })
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})
