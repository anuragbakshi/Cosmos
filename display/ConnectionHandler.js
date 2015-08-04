window.ConnectionHandler = function(world) {
	this.world = world;

	this.connection = new autobahn.Connection({
		url: "ws://cosmos:8080/ws",
		realm: "realm1"
	});

	this.connection.onopen = function(session, details) {
		session.register("cosmos.directory.join", function(argsArray, argsObject) {
			var c = new Cell(
				[100, 100],
				[0, 0],
				100,
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
