try {
	var context = new webkitAudioContext()
}
catch(err){
	alert("this uses the web audio API, try opening it in google chrome \n\n <3 whichlight" );
}

var socket = io.connect('http://localhost:8000')

var sounds = {
  0: document.querySelector('#ding'),
  1: document.querySelector('#snare'),
  2: document.querySelector('#hihat'),
  3: document.querySelector('#clap')
}

socket.on('hit', function(hit) {
  console.log(+new Date())
  var element = sounds[hit.pad]
  element.currentTime = 0
  element.play()
})