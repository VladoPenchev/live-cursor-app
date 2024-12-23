const http = require('http')
const { connect } = require('http2')
const {WebSocketServer} = require('ws')

const url = require('url')
const uuidv4 = require('uuid').v4


const server = http.createServer()
const wsServer = new WebSocketServer({ server })
const port = 8000

const connections = {}
const users = {}

const broadcastUsers = () => {
  Object.keys(connections).forEach(uuid => {
    connections[uuid].send(JSON.stringify(users))
  })
}

const handleMessage = (bytes, uuid) => {

  const message = JSON.parse(bytes.toString())
  const user = users[uuid]
  user.state = message 

  broadcastUsers()
  console.log(`user ${user.username} sent message: ${JSON.stringify(message)}`)
}

const handleClose = (uuid) => {
  console.log(`user ${users[uuid].username} disconnected.`)
  delete connections[uuid]
  delete users[uuid]
  broadcastUsers()
}

wsServer.on('connection', (connection, request) =>{

  const { username } = url.parse(request.url, true).query
  const uuid = uuidv4()

  broadcastUsers()
  console.log(`user ${username} connected.`)
  console.log(uuid)

  connections[uuid] = connection

  users[uuid] = {
    username,
    state: {    }
  }

  connection.on('message', message => handleMessage(message, uuid))
  connection.on('close', () => handleClose(uuid))

})

server.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`)
})