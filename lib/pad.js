var
  EventEmitter = require('events').EventEmitter,
  color = require('color'),
  Button = require('./button'),
  Stream = require('stream'),
  util = require('util'),
  es = require('event-stream');

function Pad(sp, config) {

  this.config = config || {};

  // Activation threshold is based on the amount of change
  // over a millisecond.  8000 is pretty high, and requires
  // a confident press of the buttons
  this.config.activationThreshold = this.config.activationThreshold || 8000;

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

  this.sp.on('data', function(line) {
    // parse the line into parts
    var
      parts = line.split(','),
      button = parseInt(parts[0], 10),
      value = parseInt(parts[1], 10);

    // emit the current pressure
    if (this.buttons[button].update(value)) {

      // Data is the last data emitted
      this.emit('data', JSON.stringify(this.buttons[button]) + '\n');
    }

  }.bind(this));
}

util.inherits(Pad, Stream);



//      _
//     | |
//  ___| |_ _ __ ___  __ _ _ __ ___  ___
// / __| __| '__/ _ \/ _` | '_ ` _ \/ __|
// \__ \ |_| | |  __/ (_| | | | | | \__ \
// |___/\__|_|  \___|\__,_|_| |_| |_|___/

//
// Writable Stream
//
Pad.prototype.write = function(value) {
  var
    str = value.toString().replace('\n', ''),
    button, r, g, b;

  // attempt to parse as json
  if (str[0] === '{' || str[0] === '[') {
    try {
      var obj = JSON.parse(str);
      console.log('obj', obj);
      // handle array
      if (obj.length) {

        // [2, "#00FF00"]
        if (obj.length == 2) {
          this.color(obj.shift(), color(obj.pop()));
          return true;

        // [255, 0, 0]
        } else if (obj.length === 3) {
          this.color(color().rgb(obj));
          return true;

        // [2, 255, 255, 0]
        } else if (obj.length === 4) {
          this.color(obj.shift(), color().rgb(obj));
          return true;
        }

      // json object
      } else if (obj.color) {

        // { "index" : 0, "color" : "#FF0000" }
        if (typeof obj.index !== 'undefined') {
          this.color(obj.index, color(obj.color));

        // { "color" : "#FF0000" }
        } else {
          this.color(color(obj.color));
        }
        return true;
      }
    } catch (e) {
      console.error(e.stack);
    }
  }

  // If this packet is exactly 4 bytes long
  // we might be onto something here
  // format: [index, r, g, b]
  // <Buffer 02 ff ff 00>
  if (value.length === 4) {
    this.color(value[0], color().rgb(value[1], value[2], value[3]));
    return true;

  // <Buffer ff ff 00>
  } else if (value.length === 3) {
    this.color(color().rgb(value[0], value[1], value[2]));
    return true;
  }

  // try to match against a regex: index#.*
  // 2#FF00FF
  var matches = str.match(/([\d]+)(#.*)/);
  if (matches) {
    var button = parseInt(matches[1], 10);
    this.color(button, matches[2]);
    return true;
  // #FF0000
  } else if (str[0] === '#') {
    this.color(str);
    return true;
  }

  // Last chance! try [index,]r,g,b
  var parts = str.replace(/ /g, '').split(',');

  // 2,255,0,0
  if (parts.length === 4) {
    var button = parseInt(parts.shift(), 10);
    console.log(button, parts);
    this.color(button, color().rgb(parts));
    return true;

  // 255,0,0
  } else if (parts.length === 3) {
    this.color(color().rgb(parts));
    return true;
  }

};

Pad.prototype.pause = function() {

};

Pad.prototype.resume = function() {

};

Pad.prototype.end = function() {
  this.writable = false;
  this.paused = true;
  this.destroy();
}

Pad.prototype.destroy = function() {

}


//
// Human usability
//
Pad.prototype.button = function(index) {

  if (typeof index === 'string' || index.length) {
    index = parseInt(index, 10);
  }

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

    var button = this.button(index);
    console.log(index, button);
    button && button.color(color);
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


