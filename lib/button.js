var
  EventEmitter = require('events').EventEmitter,
  color        = require('color');

var Button = module.exports = function Button(pad, index) {
  EventEmitter.call(this);

  this.index = index;
  this.history = [];
  this.pad = pad;

  this.init();
};

Button.prototype = new EventEmitter();

// Activation threshold is based on the amount of change
// over a millisecond.  8000 is pretty high, and requires
// a confident press of the buttons
Button.prototype.activationThreshold = 8000;

// Allow the button to be hit 64 times a second
Button.prototype.activationWindow = 1000/64;

// the current raw value of this button
Button.prototype.value = 0;

// the number of historical entries to keep around
// this is used for tracking change over time and
// helps debounce
Button.prototype.historyLength = 100;

Button.prototype.change = function(amount, time, fn) {
  var
    that = this,
    history = this.history
    last = 0;

  this.on('pressure', function() {
    var now = Date.now(), value = that.value;
    for (var i=0; i<history.length; i++) {

      if (history[i].time + time <= now) {
        var diff = value - history[i].value;

        if (diff > amount) {
          fn(diff, last);
        } else if (diff < -amount) {
          fn(diff, last);
        }
        last = diff;

        return;
      }
    }
  });
};

Button.prototype.init = function() {
  var that = this;

  this.currentColor = color('#000');

  this.on('raw', function(value) {
    var event = false;
    if (!that.pressed && value > that.activationThreshold) {
      event = 'press';
      that.pressed = true;
    } else if (that.pressed && value < that.activationThreshold) {
      event = 'depress';
      that.pressed = false;
    }

    that.history.unshift({
      value : value,
      time : Date.now()
    });

    if (this.history.length > this.historyLength) {
      that.history.length = this.historyLength;
    }

    that.value = value;
    that.emit('pressure', this);

    if (event) {
      that.emit(event, this);
    }
  });
};

Button.prototype.color = function() {
  var args = [];

  Array.prototype.push.apply(args, arguments);

  if (args.length === 0) {
    return this.currentColor;
  }

  var rgb;

  if (args.length === 1) {
    args = args.shift();
  }

  // handle color objects directly
  if (args && args.rgbArray) {
    this.currentColor = args;
    rgb = args.rgb();
  } else if (typeof args === 'string') {
    this.currentColor = color(args);
    rgb = this.currentColor.rgb();
  } else if (args.length === 3) {
    this.currentColor = color().rgb(args);
    rgb = this.currentColor.rgb();
  } else {
    return this.currentColor;
  }

  if (this.pad.sp) {
    this.pad.sp.write([this.index, rgb.r, rgb.g, rgb.b].join(',') + '\n');
  }
  return this.currentColor;
};
