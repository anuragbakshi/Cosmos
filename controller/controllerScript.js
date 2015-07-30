//osmos controller

var UID_SIZE = Math.pow(10,6);

var hammer = new Hammer.Manager($('#gesture')[0]);
var tap = new Hammer.Tap();
var swipe = new Hammer.Swipe();
hammer.add([tap,swipe]);

var con = new autobahn.Connection({
	url:"ws://anurags-mac:8080/ws",
	realm:"realm1"
});

con.onopen = function(ses,det){
	
	var connected = false;
	var uid =  Math.floor(Math.random()*UID_SIZE);
	
	function resizeCanvas(){
		$('#gesture').show().attr({width:$(window).width(),height:$(window).height()});

//		console.log($(window).width() + ' == '  + $('#gesture').width());
//		console.log($(window).height() + ' == ' + $('#gesture').height());
	}

	ses.subscribe('entry',function(arr,obj){
		if(connected)return;

		connected = obj.desc == 'joined' && obj.uid == uid;
		
		if(connected){
			$('#entry').hide();
			resizeCanvas();
		}
	});

	//$('#submit').on('click',function(){
		ses.publish('entry',[],{
			desc: "entering",
			uid: uid,
			name:$('#name').val()});
	//});

	$('#gesture').hide();

	hammer.on("tap",function(evt){
		var x = $(window).width()/2;
		var y = $(window).height()/2;

		var J = [(evt.center.x - x)/(x*2),(evt.center.y - y)/(y*2)];
		ses.publish('cmd', [],{desc:'input',impulse:J,uid:uid});

		resizeCanvas();
		
		var canvas = document.getElementById('gesture').getContext('2d');
		canvas.clearRect(0,0,$(window).width(),$(window).height());
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

		
	});

};

con.open();


