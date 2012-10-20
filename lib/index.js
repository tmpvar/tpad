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
    console.log('HEADER', header);
    sp.once('data', function waitForHeader(d) {
      console.log('IDENT', d.toString());
      try {
        var config = JSON.parse(d.toString());
        fn && fn(new Pad(sp, config));
      } catch (e) {
        console.log(e.stack);
        sp.once('data', waitForHeader);
      }
    });
  });
};
