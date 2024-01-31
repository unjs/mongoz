# 🥭 mongoz

> Zero Config MongoDB Server for Node.js

## Why?

[MongoDB](https://www.mongodb.com) is fantastic but setup for small projects can be lots of trouble.

This little package does everything necessary to download and start a fresh MongoDB server!

## Usage

**Note:** You need to have [Node.js](https://nodejs.org/en/) and [npm](https://docs.npmjs.com/cli/v7/commands/npm) already installed!

**Note:** Make sure there is not already a local mongodb server listening on default port (`27017`). If you do, either stop it or use `MONGO_PORT` environment variable to change the port.

### Standalone Server

Let's start a fresh db shall we?

```sh
npx mongoz
```

It will take few seconds on first time of usage to install and extract mongo server.

### Programmatic usage

Do you need a MongoDB server programmatically? No problems!

```js
// CommonJS
const { startMongo } = require('mongoz')

// ESM
import { startMongo } from 'mongoz'

// Install and start listening MongoDB on 127.0.0.1:27017 in background
await startMongo()

// Or with options
await startMongo({ port: 27018 })
```

When closing server, mongo will also gracefully shutdown with [node-graceful-shutdown](https://www.npmjs.com/package/node-graceful-shutdown).

#### Options

- `name`: Unique instance name. Default is `default` (env var: `MONGO_NAME`)
- `dir`: Data directory to store logs and data. Default is `${os.tmpDir}/mongo`. (env var: `MONGO_DIR`)
- `port`: Listening port. Default is `27017` (env var: `MONGO_PORT` or `PORT`)
- `args` Additional arguments passed to [`mongod`](https://docs.mongodb.com/manual/reference/program/mongod/) (should be Array)
- `platform`: OS to download binraries for.

### In parallel with script

You can also use [concurrently](https://www.npmjs.com/package/concurrently) to start mongo alongside with server:.

Via `package.json`:

```json
{
  "scripts": {
    "start": "concurrently 'npx mongoz' 'node ./server.mjs'"
  }
}
```

Or directly with `npx`:

```sh
npx concurrently 'npx mongoz' 'node ./server.mjs'
```

## Supported platforms

Windows, Linux and Darwin (Mac) are supported. Check [formula](./src/formula.ts) for details.

## Changing data dir

By default, we use a temporary directory to store data and logs. You can customize it with `MONGO_DIR` environment variable.

## License

MIT.

See [MongoDB Licensing](https://www.mongodb.com/community/licensing) for underlying server license.

