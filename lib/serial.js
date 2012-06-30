var
  serialport = require('serialport'),
  glob       = require('glob'),
  EventEmitter = require('events').EventEmitter,
  async = require('async');


var serial = module.exports = new EventEmitter();

serial.pollInterval = 500;
serial.search = function(fn) {
  this.emit('searching');

  var
    that = this,
    timer = setInterval(function poll() {

      glob('/dev/tty.usb*', function(err, matches) {

        var found = false, sp;
        if (matches && matches.length) {
          async.forEach(matches, function(match, collect) {

            // attempt to create a serial port
            sp = new serialport.SerialPort(match, {
              parser : serialport.parsers.readline('\n')
            });

            sp.on('error', function() {
              console.log('error', arguments);
            });

            var header = "", expected = 'tpad';
            sp.on('data', function(data) {
              header += data.toString();

              if (header.length > expected.length) {

                if (header.substring(0, expected.length) !== expected) {
                  // not found, collect nothing;
                  sp.close();
                  collect();
                } else {
                  sp.removeAllListeners();
                  collect(null, sp)
                }
              } else {

              }
            });

          }, function(err, sp) {
            if (err || !sp) {
              setTimeout(poll, that.pollInterval);
            } else {
              fn(null, sp);
            }
          });

        });
      } else {
        setTimeout(poll, that.pollInterval);
      }

    }, that.pollInterval);
};

serial.init = function() {
  var that = this;
  this.search(function(err, sp) {
    that.sp = sp;
    that.emit('connected')
  });
};







