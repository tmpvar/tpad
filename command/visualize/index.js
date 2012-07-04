var
  http = require('http'),
  socketio = require('socket.io'),
  path = require('path'),
  basedir = __dirname + '/public',
  fs = require('fs'),
  server = http.createServer(function(req, res) {
    if (req.url.indexOf('..') > -1) {
      return;
    }

    if (req.url === '/') {
      req.url = 'index.html';
    }

    var file = path.join(basedir, req.url);

    fs.stat(file, function(err) {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
      } else {
        var stream = new fs.createReadStream(file);
        stream.pipe(res);
      }
    })
  }),
  io = socketio.listen(server),
  hook = require('hook.io').createHook({
    ignoreSTDIN : true,
    debug: true,
    name: 'tpad::visualize',
    silent: true
  }),
  config = null,
  spawn = require('child_process').spawn;

io.set('log level', 0);

module.exports = function(tpad, spawnBrowser) {
  hook.start();

  hook.on('hook::ready', function() {
    console.log('visualizer is connected');

    hook.emit('tpad::config::request');

    hook.on('tpad::config', function(config) {

      io.sockets.on('connection', function(socket) {

        // send configuration data
        socket.emit('tpad::config', config);
      });

      server.listen(1024);
      (spawnBrowser !== false) && spawn('open', ['http://localhost:1024/']);
    });

    var time = 0;
    hook.on('tpad::pressure', function(pad) {
      var now = Date.now();
      if (pad.value === 0 || now - time > 1000/20) {
        io.sockets.emit('tpad::pressure', [pad.index, pad.value].join(','));
        time=now;
      }
    })
  });
};

module.exports.stop = function() {
  console.log(server);
  server.close();
}

