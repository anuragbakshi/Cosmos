var stats = new Stats();
stats.setMode(0);

$("body").append(stats.domElement);

var connection = new autobahn.Connection({
	url: "ws://cosmos:8080/ws",
	realm: "realm1"
});

var cells = {};

for(var i = 0; i < 100; i++) {
	var c = new Cell(
		[Math.random() * 1000, Math.random() * 500],
		[Math.random() - 0.5, Math.random() - 0.5],
		Math.random() * 100
	);

	cells[c.uid] = c;
}

function controllerJoin(argsArray, argsObject) {
	var c = new Cell(
		[100, 100],
		[0, 0],
		100,
		argsObject.name,
		argsObject.color
	);

	cells[c.uid] = c;

	return c.uid;
};

connection.onopen = function(session, details) {
	session.register("cosmos.directory.join", controllerJoin).then(
		function(registration) {
			console.log("Procedure registered:", registration.id);
		},
		function(error) {
			console.log("Registration failed:", error);
		}
	);

	session.subscribe("cmd", function(eventArray, eventObject) {
		if(eventObject.desc === "input") {
			eventObject.impulse = vec2.scl(eventObject.impulse, 10);

			var c = cells[eventObject.uid];

			var cEjected = c.ejectMass(eventObject.impulse);
			cells[cEjected.uid] = cEjected;
		}

		stage.update();
	});
};

connection.open();

function sketchMain(pjs) {
	var lastFrame = Date.now();

	pjs.setup = function() {
		pjs.size($(window).width(), $(window).height());
		pjs.textAlign(pjs.CENTER, pjs.CENTER);
		pjs.textSize(14);
	};

	pjs.draw = function() {
		stats.begin();

		var time = Date.now();
		var dt = time - lastFrame;
		lastFrame = time;

		pjs.background(0);

		var uids = Object.keys(cells);
		for(var i = 0; i < uids.length; i++) {
			var c = cells[uids[i]];
			c.update(pjs, dt);

			for(var j = i + 1; j < uids.length; j++) {
				var c2 = cells[uids[j]];
				c.handleInteraction(c2);
			}

			c.render(pjs);
		}

		for(var i = uids.length - 1; i >= 0; i--) {
			if(cells[uids[i]].dead) {
				delete cells[uids[i]];
			}
		}

		stats.end();
	};
}

var processingSketch = new Processing($("#display")[0], sketchMain);
