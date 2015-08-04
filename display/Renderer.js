window.Renderer = function(world, canvas, framerate, onRender) {
	framerate = framerate !== undefined ? framerate : 60;

	onRender = onRender !== undefined ? onRender : function() {};

	this.pjsSketch = new Processing(canvas, function(pjs) {
		pjs.setup = function() {
			pjs.size(world.width, world.height);

			pjs.frameRate(framerate);

			pjs.textAlign(pjs.CENTER, pjs.CENTER);
			pjs.textSize(14);

			pjs.noStroke();
		};

		pjs.draw = function() {
			onRender();

			pjs.background(20);

			for(var uid in world.cells) {
				var c = world.cells[uid];
				var r = Math.sqrt(c.mass);

				pjs.fill(c.color);
				pjs.ellipse(c.position[0], c.position[1], r * 2, r * 2);

				var luminance = (0.299 * (c.color >>> 16) & 0xff + 0.587 * (c.color >>> 8) & 0xff + 0.114 * (c.color >>> 0) & 0xff) / 255;

				pjs.fill(luminance > 0.5 ? 0 : 255);
				pjs.text(c.name, c.position[0], c.position[1]);
			}
		};
	});
};
