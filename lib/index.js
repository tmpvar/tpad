var
  manager = require('serialport-manager');
  Pad = require('./pad');

module.exports = function(fn) {
  return manager({
    signature : { manufacturer : 'tmpvar' },
    header : 'tpad',
    config : {
      parser : manager.serialport.parsers.readline('\n')
    }
  }, function(sp, header) {
    sp.once('data', function(d) {
      var config = JSON.parse(d.toString());
      fn && fn(new Pad(sp, config));
    });
  });
};
