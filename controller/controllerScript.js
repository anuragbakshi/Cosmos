//osmos controller

var UID_SIZE = Math.pow(10,6);

var hammer = new Hammer.Manager($('#gesture')[0]);
var tap = new Hammer.Tap();
var swipe = new Hammer.Swipe();
hammer.add([tap,swipe]);

var con = new autobahn.Connection({
	url:"ws://192.168.0.108:8080/ws",
	realm:"realm1"
});

con.onopen = function(ses,det){

	var uid = 0;

	function resizeCanvas(){
		$('#gesture').show().attr({width:$(window).width(),height:$(window).height()});

//		console.log($(window).width() + ' == '  + $('#gesture').width());
//		console.log($(window).height() + ' == ' + $('#gesture').height());
	}

	function tryToJoin(){
		ses.call('cosmos.directory.join',$('#name').val(),$('#color').val()).then(
			function(gotUid){
				uid = gotUid;
				$('#entry').hide();
				resizeCanvas();
			},
			function(err){
				console.log(err);
				tryToJoin();
			});
	}

	$('#submit').on('click',tryToJoin);

	$('#gesture').hide();

	hammer.on("tap",function(evt){
		var x = $(window).width()/2;
		var y = $(window).height()/2;

		var J = [(evt.center.x - x)/(x*2),(evt.center.y - y)/(y*2)];
		ses.publish('cmd', [],{desc:'input',impulse:J,uid:uid});

		resizeCanvas();

		var canvas = document.getElementById('gesture').getContext('2d');
		canvas.clearRect(0,0,$(window).width(),$(window).height());
		canvas.fillStyle = $('#color').val();
		canvas.fillRect(0,0,$(window).width(),$(window).height())
		canvas.beginPath();
		canvas.moveTo($('#gesture').width()/2,$('#gesture').height()/2);
		//canvas.lineWidth = 2;
		canvas.strokeStyle = 'blue';
		canvas.lineTo(Math.min(evt.center.x,$('#gesture').width()),
				Math.min(evt.center.y,$('#gesture').height()));
		canvas.stroke();
	});

	hammer.on("swipe",function(evt){
		console.log(evt);
		evt.preventDefault();
		var J = [evt.deltaX/$(window).width(),evt.deltaY/$(window).height()];
		ses.publish('cmd',[],{desc:'input',impulse:J,uid:uid});

		var canvas = document.getElementById('gesture').getContext('2d');
		canvas.clearRect(0,0,$(window).width(),$(window).height());
		canvas.beginPath();
		canvas.moveTo($('#gesture').width()/2,$('#gesture').height()/2);
		//canvas.lineWidth = 2;
		canvas.strokeStyle = 'red';
		canvas.lineTo(J[0]*$(window).width()/2,J[1]*$(window).height()/2);
		canvas.stroke();
	});

};

con.open();
