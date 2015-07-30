//osmos controller

var UID_SIZE = Math.pow(10,6);

var hammer = new Hammer.Manager($('#gesture')[0]);
var tap = new Hammer.Tap();
var swipe = new Hammer.Swipe();
hammer.add([tap,swipe]);

var con = new autobahn.Connection({
	url:"ws://cosmos:8080/ws",
	realm:"realm1"
});

con.onopen = function(ses,det){

	var uid;

	//Set up the cookie.
	var cookieName = 'cosmosName=';

	if(document.cookie.substring(0,cookieName.length) == cookieName)
		$('#name').val(document.cookie.substring(cookieName.length));
	else{
		var cookieJar = document.cookie.split(';');
		for(var i = 0; i < cookieJar.length; i++){
			if(cookieJar[i].substring(0,cookieName.length) == cookieName){
				console.log('Found ' + cookieJar[i]);
				$('#name').val(cookieJar[i].substring(cookieName.length));
			}
		}
	}

	//hide the canvas
	$('#gesture').hide();

	//Utility for the canvas
	function resizeCanvas(){
		$('#gesture').show().attr({width:$(window).width(),height:$(window).height()});
	}

	//Color manipulation utilities: distance and negative.
	//Both use hex notation.
	function colorDist(c1,c2){
		var rDiff = parseInt(c1.substring(1,3),16) - parseInt(c2.substring(1,3),16);
		var gDiff = parseInt(c1.substring(3,5),16) - parseInt(c2.substring(3,5),16);
		var bDiff = parseInt(c1.substring(5),16) - parseInt(c2.substring(5),16);

		return Math.sqrt(rDiff*rDiff + gDiff*gDiff + bDiff*bDiff);
	}

	function negateColor(hexVal){
		var HEX_VALS = "0123456789ABCDEF"

		var r = 255 - parseInt(hexVal.substring(1,3),16);
		var g = 255 - parseInt(hexVal.substring(3,5),16);
		var b = 255 - parseInt(hexVal.substring(5),16);

		var toRet = '#' + HEX_VALS[Math.floor(r/16)] + HEX_VALS[r % 16];
		toRet += HEX_VALS[Math.floor(b/16)] + HEX_VALS[b % 16];
		toRet += HEX_VALS[Math.floor(g/16)] + HEX_VALS[g % 16];

		return toRet;
	}

	//Try to join a game...
	function tryToJoin(){
		//Validate the color.
		if(colorDist($('#color').val(),'#000000') < 50){
			$('#error').show();
			$('#color').val('#ff33cc');
			return;
		}

		//Get the UID from the server and join!
		ses.call('cosmos.directory.join', [], {
			name: $('#name').val(),
			color: $('#color').val()
		}).then(
			function(gotUid){
				//Set up the screen for the game.
				console.log(gotUid);
				uid = gotUid;
				$('#entry').hide();
				resizeCanvas();
				var canvas = document.getElementById('gesture').getContext('2d');
				canvas.fillStyle = $('#color').val();
				canvas.fillRect(0,0,$(window).width(),$(window).height());

				//Set up the cookie.
				var d = new Date();
				d.setTime(d.getTime() + 9*24*60*60*1000);
				document.cookie = cookieName + $('#name').val() + ';expires=' + d.toUTCString() + ';';
			},
			function(err){
				console.log(err);
				tryToJoin();
			}
		);
	}

	//Register the submit button.
	$('#submit').on('click',tryToJoin);

	//Register the gestures.
	hammer.on("tap",function(evt){
		var x = $(window).width()/2;
		var y = $(window).height()/2;

		//Send gesture data.
		var J = [(evt.center.x - x)/(x*2),(evt.center.y - y)/(y*2)];
		ses.publish('cmd', [],{desc:'input',impulse:J,uid:uid});

		resizeCanvas();

		//Update the canvas to show the impulse vector.
		var canvas = document.getElementById('gesture').getContext('2d');
		canvas.clearRect(0,0,$(window).width(),$(window).height());
		canvas.fillStyle = $('#color').val();
		canvas.fillRect(0,0,$(window).width(),$(window).height());
		canvas.beginPath();
		canvas.moveTo($('#gesture').width()/2,$('#gesture').height()/2);
		//canvas.lineWidth = 2;
		canvas.strokeStyle = negateColor($('#color').val());
		canvas.lineTo(Math.min(evt.center.x,$('#gesture').width()),
				Math.min(evt.center.y,$('#gesture').height()));
		canvas.stroke();
	});

	hammer.on("swipe",function(evt){
		console.log(evt);
		evt.preventDefault();//tries to stop chrome's refresh on swipe down.

		//Sends the impulse.
		var J = [evt.deltaX/$(window).width(),evt.deltaY/$(window).height()];
		ses.publish('cmd',[],{desc:'input',impulse:J,uid:uid});

		//Draw the impulse vector.
		var canvas = document.getElementById('gesture').getContext('2d');
		canvas.clearRect(0,0,$(window).width(),$(window).height());
		canvas.fillStyle = $('#color').val();
		canvas.fillRect(0,0,$(window).width(),$(window).height());
		canvas.beginPath();
		canvas.moveTo($('#gesture').width()/2,$('#gesture').height()/2);
		//canvas.lineWidth = 2;
		canvas.strokeStyle = negateColor($('#color').val());
		canvas.lineTo((J[0] + 1)*$(window).width()/2,(J[1] + 1)*$(window).height()/2);
		canvas.stroke();
	});

};

con.open();
