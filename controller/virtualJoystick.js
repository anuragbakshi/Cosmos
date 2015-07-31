var REFRESH = 10;
var SENSITIVITY = .001;

function makeJoystick(canvasElem,wampSes,color, uid){
	var baseX = 0;
	var baseY = 0;
	var stickX = 0;
	var stickY = 0;
	var baseRad = 100;
	var stickRads = [75,125];

	var pressed = false;

	canvasElem.bind('touchstart',function(event){
		baseX = event.originalEvent.changedTouches[0].clientX;
		baseY = event.originalEvent.changedTouches[0].clientY;

		stickX = baseX;
		stickY = baseY;

		pressed = true;
	});

	canvasElem.bind('touchend',function(event){
		console.log(event);
		baseX = stickX = 0;
		baseY = stickY = 0;

		pressed = false;

		var canvas = canvasElem[0].getContext('2d');
		canvas.fillStyle = color;
		canvas.fillRect(0,0,$(window).width(),$(window).height());
	});

	canvasElem.bind('touchmove',function(event){
		if(pressed){
			stickX = event.originalEvent.changedTouches[0].clientX;
			stickY = event.originalEvent.changedTouches[0].clientY;
		}
	});

	function drawCircle(x,y,rad){
		var canvas = canvasElem[0].getContext('2d');
		canvas.beginPath();
		canvas.strokeStyle = window.negateColor(color);
		canvas.arc(x,y,rad,0,2*Math.PI,false);
		canvas.stroke();
	}

	setInterval(function(){
		if(pressed){
			var canvas = canvasElem[0].getContext('2d');
			canvas.fillStyle = color;
			canvas.fillRect(0,0,$(window).width(),$(window).height());
			drawCircle(baseX,baseY,baseRad);
			drawCircle(stickX,stickY,stickRads[0]);
			drawCircle(stickX,stickY,stickRads[1]);

			wampSes.publish("cmd",[],{
				desc:'input',
				impulse:vec2.scl([stickX - baseX,stickY - baseY],SENSITIVITY),
				uid:uid
			});
		}
	},REFRESH);
}
