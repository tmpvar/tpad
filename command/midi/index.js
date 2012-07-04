var midi = require('midi');
var MAX = 18000;
var output = new midi.output();
output.getPortCount();
output.getPortName(0);
output.openPort(0);

var state = {0:false, 1:false, 2: false, 3: false };

var handlePress = function(pad) {
  if (!state[pad.index]) {
    output.sendMessage([144, 60+pad.index, (pad.value/18000)*127]);
    state[pad.index] = true
  }
};

var handleDepress = function(pad) {
  if (state[pad.index]) {
    output.sendMessage([128, 60+pad.index, (pad.value/18000)*127]);
    state[pad.index] = false;
  }
};

module.exports = function(tpad) {
  tpad.each(function(pad) {
    pad.on('press', handlePress);
    pad.on('depress', handleDepress);

  });
};