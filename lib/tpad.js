var
  EventEmitter = require('events').EventEmitter;
  color  = require('color');

function Tpad(config) {

  var that = this, states = {};
  this.serialport = config.serialport;
  this.activationThreshold = config.activationThreshold || 4000;
  this.config = config.tpad;
  //
  // Hook up serialport events
  //
  this.serialport.on('data', function(data) {
    that.onSerialLine(data);
  });

  //
  // Add getters/setters for buttons
  //

  for (var i=0; i<config.tpad.pads; i++) {

    (function(pad) {
      states[pad] = new EventEmitter();
      states[pad]._history = [];

      // calculate a rolling average off of the _history array
      states[pad].debounce = function() {
        var counts = {}, sorted;

        states[pad]._history.forEach(function(history) {
          if (counts[history]) {
            counts[history]++;
          } else {
            counts[history] = 1;
          }
        });

        sorted = Object.keys(counts);

        sorted.sort(function(a, b) {
          return (counts[a]>counts[b]) ? -1 : 1;
        })

        return  sorted[0];
      };

      states[pad].on('raw', function(value) {
        var event = false;
        if (!states[pad].pressed && value > that.activationThreshold) {
          event = 'press';
          states[pad].pressed = true;
        } else if (states[pad].pressed && value < that.activationThreshold) {
          event = 'depress';
          states[pad].pressed = false;
        }

        states[pad]._history.unshift(value);
        states[pad]._history.length = 5;

        states[pad].value = states[pad].debounce();
        states[pad].emit('pressure', this);

        if (event) {
          this.emit(event, this);
        }
      });

      states[pad].value = 0;

      states[pad].color = function() {
        if (arguments.length === 0 || !arguments[0]) {
          return this._color || color('#000000');
        }

        var args = [];

        Array.prototype.push.apply(args, arguments);

        var rgb;

        if (args.length === 1) {
          args = args.shift();
        }

        // handle color objects directly
        if (args && args.rgbArray) {
          rgb = args.rgb();
        } else if (typeof args === 'string') {
          if (args[0] !== '#') {
            args = '#' + args;
          }
          this._color = color(args);
          rgb = this._color.rgb();
        }

        if (that.serialport) {
          that.serialport.write([pad, rgb.r, rgb.g, rgb.b].join(',') + '\n');
        }
      };

      that.__defineGetter__(pad, function() {
        return states[pad];
      });
      that.__defineSetter__(pad, function(val) {
        states[pad].color(val);
      });
    }(i));
  }

  var ret = function(index, color) {
    if (color) {
      that[index].color(color);
    }
    return typeof index !== 'undefined' ? that[index] : that;
  };

  ret.color = function(color) {
    for (var i = 0; i<that.config.pads; i++) {
      that[i].color(color);
    }
  };

  ret.animate = function(interval, pads, fn) {
    this.stop();

    var index = 0;
    this.timer = setInterval(function() {
      fn && fn(that[pads[index]]);
      index++;
      if (index >= pads.length) {
        index = 0;
      }
    }, interval);
  };

  ret.stop = function() {
    this.color('000000');
    clearInterval(this.timer);
  }

  return ret;
};

Tpad.prototype = {

  //
  // Handle incoming lines from serial
  //
  onSerialLine : function(line) {
    // parse the line into parts
    var
      parts = line.split(','),
      pad = parseInt(parts[0], 10),
      value = parseInt(parts[1], 10);

    // emit the current pressure
    this[pad].emit('raw', value);
  }
};

module.exports = Tpad;
