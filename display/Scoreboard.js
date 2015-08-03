window.Scoreboard = function(world, domList) {
	var $scoreboard = $(domList);

	world.onPlayerUpdate = function() {
		$scoreboard.empty();

		var players = Object.keys(world.cells)
			.map(function(uid) { return world.cells[uid]; })
			.filter(function(c) { return c.isControlled; })
			.sort(function(a, b) { return a.mass - b.mass; });

		if(players.length === 0) {
			$scoreboard.append($("<li>").text("[no players]"));
		} else {
			for(var i = 0; i < players.length; i++) {
				$scoreboard.append($("<li>").text(players[i].name));
			}
		}
	};

	world.onPlayerUpdate();
};
