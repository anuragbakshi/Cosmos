window.ConnectionHandler = function(world) {
	this.world = world;

	this.connection = new autobahn.Connection({
		url: "ws://cosmos:8080/ws",
		realm: "realm1"
	});

	this.connection.onopen = function(session, details) {
		session.register("cosmos.directory.join", function(argsArray, argsObject) {
			var c = new Cell(
				[random.randInt(100, world.width - 100), random.randInt(100, world.height - 100)],
				[0, 0],
				1000,
				argsObject.name,
				argsObject.color,
				true
			);

			world.addCell(c);

			return c.uid;
		});

		session.subscribe("cmd", function(eventArray, eventObject) {
			world.handleMessage(eventObject);
		});
	};

	this.connection.open();
};
