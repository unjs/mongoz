export const mongoFormula = {
  name: 'mongo',
  version: '4.4.6',
  port: 27017,
  exec: 'bin/mongod',
  execArgs: '--port {port} --dbpath {data}'
}
