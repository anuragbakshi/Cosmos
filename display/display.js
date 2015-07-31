var stats = new Stats();
stats.setMode(0);

// $("#display-container").append(stats.domElement);

var connection = new autobahn.Connection({
	url: "ws://cosmos:8080/ws",
	realm: "realm1"
});

var cells = {};

for(var i = 0; i < 10; i++) {
	var c = new Cell(
		[Math.random() * 1000, Math.random() * 500],
		// [Math.random() - 0.5, Math.random() - 0.5],
		[0, 0],
		Math.random() * 100
	);

	cells[c.uid] = c;
}

var scoreboardDirty = true;
var updateScoreboard = function() {
	var $scoreboard = $("#scoreboard ol");
	$scoreboard.empty();

	var players = Object.keys(cells)
		.map(function(uid) { return cells[uid]; })
		.filter(function(c) { return c.isControlled; })
		.sort(function(a, b) { return a.mass - b.mass; });

	if(players.length === 0) {
		$scoreboard.append($("<li>").text("[no players]"));
	} else {
		for(var i = 0; i < players.length; i++) {
			$scoreboard.append($("<li>").text(players[i].name));
		}
	}

	scoreboardDirty = false;
};

// TODO: Handle when a controller disconnects
connection.onopen = function(session, details) {
	session.register("cosmos.directory.join", function(argsArray, argsObject) {
		var c = new Cell(
			[100, 100],
			[0, 0],
			100,
			argsObject.name,
			argsObject.color,
			true
		);

		cells[c.uid] = c;
		scoreboardDirty = true;

		return c.uid;
	});

	session.subscribe("cmd", function(eventArray, eventObject) {
		if(eventObject.desc === "input") {
			var c = cells[eventObject.uid];

			var cEjected = c.ejectMass(eventObject.impulse);
			cells[cEjected.uid] = cEjected;
		}

		stage.update();
	});
};

connection.open();

var sketchMain = function(pjs) {
	var lastFrame = Date.now();

	pjs.setup = function() {
		// pjs.size($(window).width(), $(window).height());
		pjs.size($("#display-container").width(), $("#display-container").height());

		pjs.textAlign(pjs.CENTER, pjs.CENTER);
		pjs.textSize(14);

		pjs.noStroke();
	};

	pjs.draw = function() {
		stats.begin();

		var time = Date.now();
		var dt = time - lastFrame;
		lastFrame = time;

		pjs.background(100);

		var uids = Object.keys(cells);
		for(var i = 0; i < uids.length; i++) {
			var c = cells[uids[i]];
			c.update(pjs, dt);

			for(var j = i + 1; j < uids.length; j++) {
				var c2 = cells[uids[j]];
				var interacted = c.handleInteraction(c2);

				if(interacted && (c.isControlled || c2.isControlled)) {
					scoreboardDirty = true;
				}
			}

			c.render(pjs);
		}

		for(var i = uids.length - 1; i >= 0; i--) {
			if(cells[uids[i]].dead) {
				if(cells[uids[i]].isControlled) {
					scoreboardDirty = true;
				}

				delete cells[uids[i]];
			}
		}

		if(scoreboardDirty) {
			updateScoreboard();
		}

		stats.end();
	};
};

var processingSketch = new Processing($("#display")[0], sketchMain);
