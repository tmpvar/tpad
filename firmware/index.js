var
  fs      = require('fs'),
  request = require('request'),
  async   = require('async'),
  EM      = require('events').EventEmitter,
  tar     = require('tar'),
  zlib    = require('zlib'),
  exec    = require('child_process').exec;

function error() {
  console.log(arguments);
}

var firmware = module.exports = function(options) {
  options = options || {};

  var
    emitter        = new EM()
    firmwareFolder = options.location || __dirname + '/tpad-firmware';

  // TODO: ensure you can specify a firmware dir

  firmware.fetch(function(err, folder) {
    firmware.build(folder, function(err) {
      firmware.flash(folder, options);
    });
  });

  return emitter;
};


firmware.fetch = function(fn) {

  // get the latest firmware
  console.log('finding the latest firmware');
  request('https://api.github.com/repos/tmpvar/tpad-firmware/git/refs/tags', function(err, res) {
    var
      data    = JSON.parse(res.body),
      latest  = data.pop(),
      sha     = latest.object.sha.substring(0,7),
      shaDir  = __dirname + '/tmpvar-tpad-firmware-' + sha,
      url     = 'https://github.com/tmpvar/tpad-firmware/tarball/' + sha,
      req,
      first   = true,
      size,
      passed  = 0,
      where = 0;

    fs.exists(shaDir, function(exists) {
      if (!exists) {
        req = request(url, sha);

        console.log('found ' + latest.ref.replace('refs/tags/',''));

        console.log('downloading and extracting...');

        req.on('data', function(data) {
          passed += data.length;
          var pos = Math.floor((passed/size)*100)/10;

          if (first) {
            size = req.response.headers['content-length'];
            first = false;

          // update progress
          } else if (Math.floor(pos) > where){
            process.stdout.write('#');
            where = pos;
          }
        });

        req.pipe(zlib.Unzip())
          .pipe(tar.Extract({ path: __dirname })).on('end', function() {
            console.log(' done');
            fn(null, shaDir);
          });

      } else {
        fn(null, shaDir);
      }
    });
  });
};

// build all of the firmware
firmware.build = function(dir, fn) {
  console.log('building...');

  exec('make', {
    cwd : dir
  }, function (error, stdout, stderr) {
    if (error) {
      throw error;
    } else {
      fn();
    }
  });
};

// Basically wait for the known tpad connection to drop
// wait 2 seconds then run avrdude
firmware.waitForUser = function(dir, options, fn) {

  var state = 0;
  setTimeout(function tick() {
    fs.exists(options.serialport.port, function(e) {

      // ready to go!
      if (!e) {
        process.stdout.write('.')
        state = 1;
        setTimeout(tick, 100);
      } else if (state === 1) {
        console.log('ready to flash.. waiting');
        options.serialport.close();
        setTimeout(function() {
          fn(dir + '/tpad/' + options.tpad.name);
        }, 2000);
      } else {
        setTimeout(tick, 100);
      }
    });
  }, 100);
};

firmware.flash = function(dir, options, fn) {

  console.log('Please press reset on the device.....');

  firmware.waitForUser(dir,options, function(tpadFirmwareDir) {
    console.log('flashing...');
    var env = process.env;
    env.AVRDUDE_PORT = options.serialport.port;

    exec('make avrdude', {
      cwd : tpadFirmwareDir,
      env : env
    }, function (err, stdout, stderr) {
      if (err) { throw err; }
      console.log('OK!')
      process.exit();
    });
  });
};