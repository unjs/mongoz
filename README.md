# 🥭 mongoz

> Ad hoc MongoDB server for Node.js

## Why?

[MongoDB](https://www.mongodb.com) is fantastic but setup for small projects can be lots of trouble.

This little package does everything necessary to download and start a fresh mongo server!

## Usage

**Note:** You need to have [Node.js](https://nodejs.org/en/) and [npm](https://docs.npmjs.com/cli/v7/commands/npm) already installed!

**Note:** Make sure there is not already a local mongodb server listening on default port (`2701`). If you do, either stop it or use `PORT` environment variable to change the port.

### Standalone Server

Let's start a fresh mongoz shall we?

```sh
npx mongoz
```

It will take few seconds on first time of usage to install and extract mongo server.

### Programmatic Usage

Do you need a MongoDB server? No problems!

```js
// CommonJS
const { startMongo } = require('mongoz')

// ESM
import { startMongo } from 'mongoz'

// Install and start listening MongoDB on 127.0.0.1:27017 in background
await startMongo()
```

When closing server, mongo will also gracefully shutdown with [node-graceful-shutdown](https://www.npmjs.com/package/node-graceful-shutdown).

### In parallel with server

You can also use [concurrently](https://www.npmjs.com/package/concurrently) to start mongo alongside with server:

`package.json`:

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

Windows, Linux and Darwin (Mac) are supported. Check [formula](./src/formula) for details.

## Changing data dir

By default, we use a temporary directory to store data and logs. You can customize it with `MONGO_DIR` environment variable.

## License

MIT.

See [MongoDB Licensing](https://www.mongodb.com/community/licensing) for underlying server license.

