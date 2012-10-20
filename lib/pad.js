var
  EventEmitter = require('events').EventEmitter,
  color = require('color'),
  Button = require('./button'),
  Stream = require('stream'),
  util = require('util'),
  es = require('event-stream');

function Pad(sp, config) {

  this.config = config || {
    activationThreshold : 8000
  };

  this.sp = sp;
  this.readable = true;
  this.writable = true;

  // Add Button instances
  // TODO: fix the pad/button disparity
  //       requires firmware update
  this.buttons = [];
  while (this.buttons.length < this.config.pads) {
    this.buttons.push(new Button(this, this.buttons.length));
  }
}

util.inherits(Pad, Stream);

//
// Stream
//
Pad.prototype.write = function() {

};

Pad.prototype.pause = function() {

};

Pad.prototype.resume = function() {

};


//
// Human usability
//
Pad.prototype.button = function(index) {
  if (this.buttons && this.buttons[index]) {
    return this.buttons[index];
  }
};

Pad.prototype.color = function(index, color) {
  if (typeof color === 'undefined') {
    color = index;
    this.each(function(button) {
      button.color(color);
    });
  } else {
    this.button(index).color(color);
  }
};

Pad.prototype.each = function(fn) {
  fn && this.buttons.forEach(fn);
};

Pad.prototype.animate = function(interval, buttons, fn) {

  var
    index = 0,
    that = this;

  this.stop();

  this.timer = setInterval(function() {
    fn && fn(that.buttons[buttons[index]]);
    index++;
    if (index >= buttons.length) {
      index = 0;
    }
  }, interval);
};

Pad.prototype.stop = function() {
  this.timer && clearInterval(this.timer);
};

module.exports = Pad;

/*
function Tpad(config) {

  //
  // Hook up serialport events
  //
  this.serialport.on('data', function(data) {
    that.onSerialLine(data);
  });
};

Tpad.prototype = {

  //
  // Handle incoming lines from serial
  //
  onSerialLine : function(line) {
    // parse the line into parts
    var
      parts = line.split(','),
      button = parseInt(parts[0], 10),
      value = parseInt(parts[1], 10);

    // emit the current pressure
    this.buttons[button].emit('raw', value);
  }
};*/

