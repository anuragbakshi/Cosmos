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

for(var i = 0; i < 10; i++) {
	var c = new Cell(
		[Math.random() * 1000, Math.random() * 500],
		[Math.random() - 0.5, Math.random() - 0.5],
		// [0, 0],
		Math.random() * 100
	);

	world.addCell(c);
}
