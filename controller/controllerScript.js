//osmos controller

//var UID_SIZE = Math.pow(10,6);

var REFRESH = 100;
var SENSITIVITY = .005;
var ANIMATION_DURATION = 500;

// For hammer, if swiping is to be used.
// var hammer = new Hammer.Manager($('#gesture')[0]);
// var tap = new Hammer.Tap();
// var swipe = new Hammer.Swipe();
// hammer.add([tap,swipe]);

var con = new autobahn.Connection({
	url:"ws://192.168.0.108:8080/ws",
	realm:"realm1"
});

con.onopen = function(ses,det){
	var uid;

	var joystickMade = false;

	function makeJoystick(){
		if(!joystickMade){
			var stk = new VirtualJoystick({
				container: $('#gesture')[0],
				mouseSupport: true,
				strokeStyle: negateColor($('#color').val())
			});

			var pressed = false;

			stk.addEventListener('touchStart',function(){
				pressed = true;
			});

			stk.addEventListener('touchEnd',function(){
				pressed = false;
			});

			stk.addEventListener('mouseUp',function(){
				pressed = false;
			});

			stk.addEventListener('mouseDown',function(){
				pressed = true;
			});

			setInterval(function(){
				if(pressed){
					impulse = vec2.scl([stk.deltaX(),stk.deltaY()],SENSITIVITY);
					ses.publish('cmd',[],{
						desc:'input',
						impulse: impulse,
						uid: uid
					});
				}
			},REFRESH);

			joystickMade = true;
		}
	}

	//Set up the cookie.
	var nameCookie = 'cosmosName=';
	var colorCookie = 'cosmosColor=';

	function handleCookie(){
		if(document.cookie == undefined)
			return;

		var cookieJar = document.cookie.split('; ');
		for(var i = 0; i < cookieJar.length; i++){
			if(cookieJar[i].substring(0,nameCookie.length) == nameCookie){
				//console.log('Found ' + cookieJar[i]);
				$('#name').val(cookieJar[i].substring(nameCookie.length));
			}
			if(cookieJar[i].substring(0,colorCookie.length) == colorCookie){
				$('#color').val(cookieJar[i].substring(colorCookie.length));
			}
		}
	}

	function setCookie(){
		if(document.cookie == undefined)
			return;

		var d = new Date();
		d.setTime(d.getTime() + 9*24*60*60*1000);
		var expiration = ';expires=' + d.toUTCString() + ';';
		document.cookie = nameCookie + $('#name').val() + expiration;
		document.cookie = colorCookie + $('#color').val() + expiration;
	}

	handleCookie();

	//Utility for the canvas
	function resizeCanvas(){
		$('#gesture').show()
			.attr({width:$(window).width(),height:$(window).height()})
			.css('background-color',$('#color').val());
	}

	function animateJoin(){
		var colorLeft = $("option[value='"+ $('#color').val() +"']").offset().left;
		var colorTop = $("option[value='"+ $('#color').val() +"']").offset().top;

		$('#ink ').show()
			.css('background-color',$('#color').val())
			.css({
				top: colorTop + 'px',
			 	left: colorLeft + 'px'})
			.css({
				width:$('#ink').parent().width(),
				height:$('#ink').parent().height()})
			.addClass('animate');

		$('#intro').fadeOut(ANIMATION_DURATION/2);
		$('#entry').fadeOut(ANIMATION_DURATION/2);

		setTimeout(function(){
			resizeCanvas();
			makeJoystick();
		},ANIMATION_DURATION);

	}

	//Color manipulation utilities: distance and negative.
	//Both use hex notation.
	function colorDist(c1,c2){//Not used.
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

	//make color picker
	$('#color').simplecolorpicker({theme: 'regularfont'});

	//Try to join a game...
	function tryToJoin(){

		//Get the UID from the server and join!
		ses.call('cosmos.directory.join', [], {
			name: $('#name').val(),
			color: $('#color').val()
		}).then(
			function(gotUid){
				console.log(gotUid);
				uid = gotUid;

				animateJoin();
				//Set up the cookie.
				setCookie();
			},
			function(err){
				console.log(err);
				tryToJoin();
			}
		);
	}

	//Register the submit button.
	$('#submit').on('click',tryToJoin);

/** Code for swiping (in case of future need).
	hammer.on('swipe',function(evt){
		var J = [Math.cos(evt.angle * Math.PI / 180),Math.sin(evt.angle * Math.PI/180)];
 		ses.publish('cmd',[],{desc:'input',impulse:J,uid:uid});

		var canvas = document.getElementById('gesture').getContext('2d');
		canvas.clearRect(0,0,$(window).width(),$(window).height());
		canvas.beginPath();
		canvas.moveTo($('#gesture').width()/2,$('#gesture').height()/2);
		canvas.lineWidth = 2;
		canvas.strokeStyle = negateColor($('#color').val());
		canvas.lineTo(evt.deltaX + $(window).width()/2,evt.deltaY + $(window).height()/2);
		canvas.stroke();
	});
**/
};

con.open();
