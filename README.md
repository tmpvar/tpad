#tpad

## Usage
### repl mode

    npm install -g tpad


#### commands

`tpad.color(0, color)` - change the color of a button

`tpad.color('#FF0')` - set the color of all the leds

##### button operations

`tpad.button(index)` - get a button

`tpad(index).on([pressure,press,depress], function(button) {})` - bind to events

change the color of button[0] based on the amount of pressure applied

tpad.each(function(button) {
  button.on('pressure', function() {
    button.color(button.color().hsv((button.value/18000)*360, 100, 100));
  });
});


##### pre-baked functionality

_very_ basic animation

```javascript

tpad.animate(100, [0,1,2,3], function(pad) {
  tpad.color('000'); // turn all the lights off
  button.color('F00'); // turn the current button red
});
```

or shift on hsv!

```javascript

var a = 0;
tpad.animate(100, [0,1,3,2], function(p) {
  a+=70;
  if(a>360) {
    a=0;
  }

  p.color(color().hsv(a, 100, 100));
});
```

and to stop the animation `tpad.stop()`
calling `tpad.animate` again will first stop the currently running animation

`tpad.each(function(pad, index) { })` - iterate through the buttons

`visualize()` - this will spawn an http server and open a browser window so you can see pressure changes as you press buttons

`midi()` - causes a button to emit a midi note (starting at middle C + button index)

### as a library

    var tpad = require('tpad');

    // start waiting for a tmpad to be connected
    var manager = tpad(function(tmpad) {
      // now we have a tmpad!
      tmpad.animate(100, [0,1,3,2], function(button) {
        a+=70;
        if(a>360) {
          a=0;
        }

        button.color(color().hsv(a, 100, 100));
      });
    });

    // manager is an EventEmitter that emits 3 events
    // searching, connected, and disconnected

But that is not all, you can also stream the button data from the tmpad to wherever you want!

    var fs = require('fs');
    require('tpad')(function(tmpad) {
      tmpad.pipe(fs.createWriteStream('/tmp/tmpad.log'));
    });

### from the command line

options

#### `-i` stream from stdin

This allows you to push color data to the tmpad buttons.

See the `Writable` stream interface below for more information


#### `-o` stream to stdout

Whenever a button's pressure value is changed a `\n` delimited stream of json will be output

See the


## Stream Interface

here's how you use the tmpad streaming interface

    var tpad = require('tpad');
    tpad(function(tmpad) {

      // to push color data to the tmpad just pipe it in
      colorStream.pipe(tmpad); // see Writable below

      // to get pressure data and other fun out of the tmpad
      tmpad.pipe(process.stdout); // see Readable below

    });


### Writable

*note*: the following formats are expected to be `\n` delimited

Allowed formats

__index#hex__

`1#0000FF` or `1#F00` - set button 1 to red

`#0000FF` - set all buttons to red

__index,r,g,b__

`2,255,0,0` - set button #2 to red

`255,0,0` - set all buttons to red


__buffer__

`<Buffer 02 ff ff 00>` - set button #2 to 255,255,0

`<Buffer ff ff 00>` - set all buttons to 255,255,0


__json__

`[0, "#00FF00"]`, `[0,0,255,0]`, `{ "index" : 0, "color" : "#00FF00" }` - set button 0 to green

`["#00FF00"]`, `[0,255,0]`, `{ "color" : "#00FF00" }` - set all buttons to green


### Readable

example:

    $ tpad -o
    {"index" : 0, "value":125,"history":[]}
    {"index" : 0, "value":0, "history":[{ value : 125, time : 1350748921622 ]}