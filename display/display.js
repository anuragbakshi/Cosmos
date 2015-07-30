var EPSILON = 1e-6;
var EJECTION_VELOCITY = 0.2;

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

			// var cellMomentum = c.mass * vec2.mag(c.velocity);
			c.mass -= ejectedMass;
			c.velocity = vec2.add(c.velocity, vec2.scl(eventObject.impulse, 1 / c.mass));
			// console.log(c.velocity);

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
		var time = Date.now();
		var dt = time - lastFrame;
		lastFrame = time;

		// dt /= 5;

		// console.log("FPS: " + 1000 / dt);

		pjs.background(200);
		pjs.fill(100);

		// console.log(Object.keys(cells).length);
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

			for(var j = i + 1; j < uids.length; j++) {
				var c2 = cells[uids[j]];
				if(c2.dead) {
					continue;
				}

				var r2 = Math.sqrt(c2.mass);

				// check for collision
				var d = vec2.mag(vec2.sub(c.position, c2.position));
				if(d < r + r2) {
					var dm;
					if(d > Math.max(r, r2)) {
						dm = (d * Math.sqrt(-d * d + 2 * (c.mass + c2.mass)) + Math.min(c.mass, c2.mass) - Math.max(c.mass, c2.mass)) / 2;
					} else {
						dm = Math.min(c.mass, c2.mass)
					}

					if(c.mass < c2.mass) {
						var impartedMomentum = vec2.scl(c.velocity, dm);
						var momentum = vec2.sub(vec2.scl(c.velocity, c.mass), impartedMomentum);
						var momentum2 = vec2.add(vec2.scl(c2.velocity, c2.mass), impartedMomentum);

						c.mass -= dm;
						c2.mass += dm;

						c.velocity = vec2.scl(momentum, 1 / c.mass);
						c2.velocity = vec2.scl(momentum2, 1 / c2.mass);
					} else {
						var impartedMomentum = vec2.scl(c2.velocity, dm);
						var momentum = vec2.add(vec2.scl(c.velocity, c.mass), impartedMomentum);
						var momentum2 = vec2.sub(vec2.scl(c2.velocity, c2.mass), impartedMomentum);

						c.mass += dm;
						c2.mass -= dm;

						c.velocity = vec2.scl(momentum, 1 / c.mass);
						c2.velocity = vec2.scl(momentum2, 1 / c2.mass);
					}

					if(c.mass <= EPSILON) {
						c.dead = true;
					}

					if(c2.mass <= EPSILON) {
						c2.dead = true;
					}
				}
			}

			pjs.ellipse(c.position[0], c.position[1], r * 2, r * 2);
		}

		for(var i = uids.length - 1; i >= 0; i--) {
			if(cells[uids[i]].dead) {
				delete cells[uids[i]];
			}
		}
	};
}

var processingSketch = new Processing($("#display")[0], sketchMain);
