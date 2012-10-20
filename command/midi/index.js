try {
  var midi = require('midi');
} catch (e) {
  console.log('WARNING: midi module not found, it will not work!');
  module.exports = function() {};
  return;
}
var MAX = 18000;
var offColor = '#002200';

var output = new midi.output();
output.getPortCount();
output.getPortName(0);
output.openPort(0);

var state = {0:false, 1:false, 2: false, 3: false };

var calculateVelocity = function(value, activationThreshold, lower) {
  lower = lower || 0;
  var velocity = Math.floor(lower + ((value- activationThreshold )/(18000- activationThreshold))*127-lower);
  if (velocity > 127) { velocity = 127; }
  return velocity;
};

module.exports = function(tpad, scale, activationThreshold) {
  activationThreshold = activationThreshold || 3000;
  scale = scale || 1;
  var handlePress = function(pad) {
    if (!state[pad.index] ||
        (!state[pad.index].on && Date.now() - state[pad.index].time > 1000/64)
       )
    {

      output.sendMessage([
        144,
        60+pad.index*scale,
        calculateVelocity(pad.value, activationThreshold)
      ]);

      state[pad.index] = { on : true, time : Date.now() };
      pad.color('#00FF00');
    }
  };

  var handleDepress = function(pad) {
    if (state[pad.index].on) {

      output.sendMessage([128, 60+pad.index*scale, 127]);

      state[pad.index].on = false;
      pad.color(offColor);
      pad.once('press', handlePress);
    }
  };

  tpad.each(function(pad, i) {
    pad.color(offColor);
    pad.change(activationThreshold, 1, function(val) {
      if (val < 0) {
        handleDepress(pad);
      } else {
        handlePress(pad);
      }
    });

    pad.on('raw', function() {
      console.log(pad.value);
      if (pad.value === 0) {
        handleDepress(pad);
      } else if (state[pad.index].on && pad.value > activationThreshold) {
        // aftertouch
        output.sendMessage([
          160,
          60+pad.index*scale,
          calculateVelocity(pad.value, activationThreshold)
        ]);
      }
    });
  });
};