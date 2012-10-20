var tpad = require('../lib');

tpad(function (tmpad) {
  var a = 0;

  tmpad.animate(10, [0,1,3,2], function(button) {
    a+=5;
    if (a > 360) {
      a = 0;
    }

    button.color(button.color().hsv(a, 100, 100));
  });
})
