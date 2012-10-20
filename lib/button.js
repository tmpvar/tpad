var
  EventEmitter = require('events').EventEmitter,
  color        = require('color');

var Button = module.exports = function Button(pad, index) {
  EventEmitter.call(this);

  this.index = index;
  this.history = [];
  this.pad = pad;

  this.color('#FFE800');
};

Button.prototype = new EventEmitter();

// Allow the button to be hit 64 times a second
Button.prototype.activationWindow = 1000/64;

// If a value is < this number treat it like 0
Button.prototype.lowerBound = 1024;

// the current raw value of this button
Button.prototype.value = 0;

// Store whether or not this button is "pressed", which means
// it has changed by the `activationThreshold` amount within
// the `activationWindow`
Button.prototype.pressed = false;

// the number of historical entries to keep around
// this is used for tracking change over time and
// helps debounce
Button.prototype.historyLength = 100;

//
// Incoming pressure value from the serialport stream
//
Button.prototype.update = function(value) {
  this.value = value;
};

Button.prototype.toJSON = function() {
  return {
    index: this.index,
    value: this.value,
    delta: this.delta,
    pressed: this.pressed
  };
}

Button.prototype.update = function(value) {
  var
    that = this,
    history = this.history
    last = 0,
    now = Date.now(),
    threshold = this.pad.config.activationThreshold;

  if (value <= this.lowerBound) {
    value = 0;
    if (!this.pressed && this.value === 0) {
      return false;
    }
  }

  this.value = value;

  that.history.unshift({
    value : value,
    time : Date.now()
  });

  if (this.history.length > this.historyLength) {
    that.history.length = this.historyLength;
  }

  for (var i=0; i<history.length; i++) {

    if (history[i].time + this.activationWindow <= now) {
      var diff = this.delta = value - history[i].value;

      this.pad.emit('pressure', this);

      if (diff > threshold) {
        this.pressed = true;
        this.pad.emit('press', this);
      } else if (diff < -(threshold/2) || value < threshold/2) {
        this.pressed = false;
        this.pad.emit('depress', this);
      }

      last = diff;
      return true;
    }
  }
  return false;
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
