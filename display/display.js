var stats = new Stats();
stats.setMode(0);

window.speed = 1;

var FRAMERATE = 60;
var FIXED_WIDTH = 2000;

var lastFrameTime = Date.now();

var $displayContainer = $("#display-container");
var $display = $("#display");
var $scoreboardList = $("#scoreboard ol");

var scale = FIXED_WIDTH / $displayContainer.width();

var world = new World(scale * $displayContainer.width(), scale * $displayContainer.height());
var scoreboard = new Scoreboard(world, $scoreboardList[0]);
var renderer = new Renderer(world, $display[0], FRAMERATE, scale, function() {
	var time = Date.now();
	var dt = time - lastFrameTime;

	world.step(dt * window.speed);

	lastFrameTime = time;
});

var connectionHandler = new ConnectionHandler(world);

for(var i = 0; i < 100; i++) {
	var c = new Cell(
		[random.randInt(0, world.width), random.randInt(0, world.height)],
		[random.rand(-0.01, 0.01), random.rand(-0.01, 0.01)],
		random.randInt(50, 100)
	);

	world.addCell(c);
}

// var largest = this.cells[uids[0]];
//
// if(c.mass > largest.mass) {
// 	largest = c;
// }
// if(!largest.dead && !largest.isControlled && largest.mass > Cell.PLAYER_START_MASS) {
// 	largest.split();
// }
