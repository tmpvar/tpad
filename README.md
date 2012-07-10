#tpad

## Usage
### repl mode

    git clone https://github.com/tmpvar/tpad.git
    cd tpad
    npm install .
    bin/tpad

TODO: of course this will go to npm, very soon.

#### commands

`tpad(index, color)` - change the color of a pad

`tpad.color('#FF0')`- set the color of all the leds

##### pad operations

`tpad(index)` - get a pad

`tpad(index).on([pressure,press,depress], function(pad) {})` - bind to events

`tpad(index).color('#fff');` - change the color of an individual pad

`tpad(0).on('pressure', function(p) { p.color(color().hsv((p.value/18000)*360, 100, 100)); })` - change the color of pad[0] based on the amount of pressure applied


##### pre-baked functionality

_very_ basic animation

```javascript

tpad.animate(milliseconds, [0,1,2,3], function(pad) {
  tpad.color('000'); // turn all the lights off
  pad.color('F00'); // turn the current pad red
});
```

and to stop the animation `tpad.stop()`
calling `tpad.animate` again will first stop the currently running animation

`tpad.each(function(pad, index) { })` - iterate through the pads

`visualize()` - this will spawn an http server and open a browser window so you can see pressure changes as you press buttons

`midi()` - causes a pad to emit a midi note (starting at middle C + pad index)

### as a library

soon..
