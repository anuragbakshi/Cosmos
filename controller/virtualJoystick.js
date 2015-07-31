var REFRESH = 10;
var SEND_GAP = 3;
var SENSITIVITY = .001;

function makeJoystick(canvasElem,wampSes,color, uid){
	var baseX = 0;
	var baseY = 0;
	var stickX = 0;
	var stickY = 0;
	var screenToRad = 15;

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
		canvas.lineWidth = 3;
		canvas.arc(x,y,rad,0,2*Math.PI,false);
		canvas.stroke();
	}

	var tick = 0;

	setInterval(function(){
		if(pressed){
			var canvas = canvasElem[0].getContext('2d');
			canvas.fillStyle = color;
			canvas.fillRect(0,0,$(window).width(),$(window).height());

			var radius = Math.min($(window).width(),$(window).height())/screenToRad;

			drawCircle(baseX,baseY,radius);
			drawCircle(stickX,stickY,radius - 10);
			drawCircle(stickX,stickY,radius + 10);

			if(tick % SEND_GAP == 0)
				wampSes.publish("cmd",[],{
					desc:'input',
					impulse:vec2.scl([stickX - baseX,stickY - baseY],SENSITIVITY),
					uid:uid
				});

			tick++;
		}else{
			tick = 0;
		}
	},REFRESH);
}
