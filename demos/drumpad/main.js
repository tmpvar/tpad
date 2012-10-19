try {
	var context = new webkitAudioContext()
}
catch(err){
	alert("this uses the web audio API, try opening it in google chrome \n\n <3 whichlight" );
}

var socket = io.connect('http://localhost:8000')

var sounds = {
  0: document.querySelector('#catmeow'),
  1: document.querySelector('#snare'),
  2: document.querySelector('#kick'),
  3: document.querySelector('#meow')
}

var images = window.images = [];
for (var i = 1; i<144; i++) {
  var seq = i + "";
  while(seq.length < 3) {
    seq = "0" + seq;
  }
  var img = new Image();
  img.src = "/img/image-" + seq + '.jpeg';
  img.width = 600;
  images.push(img)
}

var animations = [
  { start : 11, end : 38, fps : 60 },
  { start : 1, end : 10 },
  { start : 50, end : 70 },
  { start : 105, end : 120, fps : 6  }
];

var bouncy = {};

var imageHolder = document.getElementById('image');
var timer, idx = 1;
socket.on('hit', function(hit) {
  var element = sounds[hit.pad];
  var now = Date.now();
  if (!bouncy[hit.pad] || now - bouncy[hit.pad] > 150) {
    bouncy[hit.pad] = now;
  } else { return; }

  var animation = animations[hit.pad];

  element.currentTime = 0;
  idx = animation.start;
  clearInterval(timer);
  timer = setInterval(function() {
    imageHolder.innerHTML = "";
    imageHolder.appendChild(images[idx++]);
    if (idx >= animation.end) {
      if (animation.loop) {
        idx = animation.start;
      } else {
        clearInterval(timer);
      }
    }
  }, 1000/(animation.fps || 30));
  element.play();
})