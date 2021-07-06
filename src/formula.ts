export const mongoFormula = {
  name: 'mongo',
  version: '4.4.6',
  port: 27017,
  exec: 'bin/mongod',
  execArgs: '--port {port} --dbpath {data}',
  platforms: [
    {
      name: 'linux',
      source: 'https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-ubuntu2004-4.4.6.tgz'
    },
    {
      name: 'win32',
      source: 'https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-4.4.6.zip'
    },
    {
      name: 'darwin',
      source: 'https://fastdl.mongodb.org/osx/mongodb-macos-x86_64-4.4.6.tgz'
    }
  ]
}
