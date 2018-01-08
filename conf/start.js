const config = require('./setting')
const server = require('./server')
const debug = require('debug')('app:server')
const port = config.server_port

server.listen(port)
debug(`Server is now running at http://localhost:${port}.`)
