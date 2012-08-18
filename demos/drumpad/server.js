var http = require('http')
var socketio = require('socket.io')
var fs = require('fs')
var tpad = require('../../lib/tpad')
var color = require('color')
var ecstatic = require('ecstatic')(__dirname)

tpad.init(function (err, tpad) {
  var enabled = {0: true, 1: true, 2: true, 3: true}
  tpad.each(function(pad, index) {
    pad.on('pressure', function(p) {
      console.log(p.value)
      if (p.value === 0) return enabled[index] = true
      if (!enabled[index]) return
      enabled[index] = false
      io.sockets.emit('hit', {pad: index, value: p.value})
    })
  })
})

var server = http.createServer(function(req, res) {
  if (req.url.match(/socket\.io/)) return
  ecstatic(req, res)
})
var io = socketio.listen(server)
io.set('log level', 1)
console.log('Listening on :8000')
server.listen(8000)