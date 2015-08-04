var stats = new Stats();
stats.setMode(0);

var FRAMERATE = 60;

var lastFrameTime = Date.now();

var $displayContainer = $("#display-container");
var $display = $("#display");
var $scoreboardList = $("#scoreboard ol");

var world = new World($displayContainer.width(), $displayContainer.height());
var scoreboard = new Scoreboard(world, $scoreboardList[0]);
var renderer = new Renderer(world, $display[0], FRAMERATE, function() {
	var time = Date.now();
	var dt = time - lastFrameTime;

	world.step(dt);

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
