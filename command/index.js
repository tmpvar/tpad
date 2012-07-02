var
  glob = require('glob'),
  path = require('path');

module.exports = function(repl) {
  glob(__dirname + '/*', function(err, matches) {
    matches.forEach(function(match) {
      if (match !== 'index.js') {
        var name = path.basename(match);
        repl.context[name] = require(match);
      }
    });
  });
};