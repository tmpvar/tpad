var repl = require('repl'), start = repl.start;

repl.start = function() {

  var server = start.apply(this, arguments);
  server.stop = function() {
    server.rli.close();
  }
  return server;
};

module.exports = repl;