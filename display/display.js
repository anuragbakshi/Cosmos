var EJECTION_VELOCITY = 0.2;

var stats = new Stats();
stats.setMode(0);

$("body").append(stats.domElement);
console.log(stats.update.toString());

var connection = new autobahn.Connection({
	url: "ws://anurags-mac:8080/ws",
	realm: "realm1"
});

var cellUIDCounter = -1;
var cells = {};

for(; cellUIDCounter > -500; cellUIDCounter--) {
	cells[cellUIDCounter] = {
		uid: cellUIDCounter,
		position: [Math.random() * 1000, Math.random() * 500],
		velocity: [Math.random() - 0.5, Math.random() - 0.5],
		mass: Math.random() * 100
	};
}

connection.onopen = function(session, details) {
	session.subscribe("entry", function(eventArray, eventObject) {
		if(eventObject.desc === "entering") {
			session.publish("entry", [], {
				uid: eventObject.uid,
				desc: "joined"
			});

			cells[eventObject.uid] = {
				uid: eventObject.uid,
				position: [100, 100],
				velocity: [0, 0],
				mass: 10000,
				dead: false
			};
		}
	});

	session.subscribe("cmd", function(eventArray, eventObject) {
		if(eventObject.desc === "input") {
			eventObject.impulse = vec2.scl(eventObject.impulse, 50);

			var c = cells[eventObject.uid];
			var r = Math.sqrt(c.mass);

			var ejectedMass = vec2.mag(eventObject.impulse) / EJECTION_VELOCITY;

			c.mass -= ejectedMass;
			c.velocity = vec2.add(c.velocity, vec2.scl(eventObject.impulse, 1 / c.mass));

			console.log(vec2.add(c.position, vec2.scl(vec2.norm(eventObject.impulse), -r)));
			cells[cellUIDCounter] = {
				uid: cellUIDCounter,
				position: vec2.add(c.position, vec2.scl(vec2.norm(eventObject.impulse), -r)),
				velocity: vec2.scl(vec2.norm(eventObject.impulse), -EJECTION_VELOCITY),
				mass: ejectedMass
			};
			console.log(Object.keys(cells).length);

			cellUIDCounter--;
		}

		stage.update();
	});
};

connection.open();

function sketchMain(pjs) {
	var lastFrame = Date.now();

	pjs.setup = function() {
		pjs.size($(window).width(), $(window).height());
	};

	pjs.draw = function() {
		stats.begin();

		var time = Date.now();
		var dt = time - lastFrame;
		lastFrame = time;

		pjs.background(200);
		pjs.fill(100);

		var uids = Object.keys(cells);
		for(var i = 0; i < uids.length; i++) {
			var c = cells[uids[i]];
			if(c.dead) {
				continue;
			}

			var r = Math.sqrt(c.mass);

			// apply velocity
			c.position = vec2.add(c.position, vec2.scl(c.velocity, dt));

			// bounce off edges
			if(c.position[0] - r < 0 || c.position[0] + r > pjs.width) {
				c.velocity[0] *= -1;
				c.position[0] = Math.max(r, Math.min(c.position[0], pjs.width - r));
			}

			if(c.position[1] - r < 0 || c.position[1] + r > pjs.height) {
				c.velocity[1] *= -1;
				c.position[1] = Math.max(r, Math.min(c.position[1], pjs.height - r));
			}

			// handle collisions
			for(var j = i + 1; j < uids.length; j++) {
				var c2 = cells[uids[j]];
				if(c2.dead) {
					continue;
				}

				var r2 = Math.sqrt(c2.mass);

				// check for collision
				var d = vec2.mag(vec2.sub(c.position, c2.position));
				if(d < r + r2) {
					var dm = (d * Math.sqrt(-d * d + 2 * (c.mass + c2.mass)) + Math.min(c.mass, c2.mass) - Math.max(c.mass, c2.mass)) / 2;
					dm = (dm < 0)? -dm:dm;
					dm = Math.min(c.mass, c2.mass, dm);
					if(c.mass < c2.mass) {
						c.mass -= dm;
						c2.mass += dm;
					} else {
						c.mass += dm;
						c2.mass -= dm;
					}

				var cSmall, cLarge;
				if(c.mass < c2.mass) {
					cSmall = c;
					cLarge = c2;
				} else {
					cSmall = c2;
					cLarge = c;
				}

				var rSmall = Math.sqrt(cSmall.mass);
				var rLarge = Math.sqrt(cLarge.mass);

				var d = vec2.mag(vec2.sub(cSmall.position, cLarge.position));

				if(d < rSmall + rLarge) {		// some collision
					var dm;

					if(d < rLarge) {			// full absorbtion
						dm = cSmall.mass;
						cSmall.dead = true;
					} else {					// partial absorbtion
						dm = (d * Math.sqrt(2 * (cSmall.mass + cLarge.mass) - d * d) + cSmall.mass - cLarge.mass) / 2;
					}

					// calculate momentum transferred (impulse)
					var pSmall = vec2.scl(cSmall.velocity, cSmall.mass);
					var pLarge = vec2.scl(cLarge.velocity, cLarge.mass);

					var dp = vec2.scl(cSmall.velocity, dm);

					cSmall.mass -= dm;
					cLarge.mass += dm;

					cSmall.velocity = vec2.scl(vec2.sub(pSmall, dp), 1 / cSmall.mass);
					cLarge.velocity = vec2.scl(vec2.add(pLarge, dp), 1 / cLarge.mass);
				}
			}

			pjs.ellipse(c.position[0], c.position[1], r * 2, r * 2);
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
