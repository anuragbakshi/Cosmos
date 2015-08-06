window.Renderer = function(world, canvas, framerate, scale, onRender) {
	framerate = framerate !== undefined ? framerate : 60;
	scale = scale !== undefined ? scale : 1;

	onRender = onRender !== undefined ? onRender : function() {};

	var _this = this;

	this.pjsSketch = new Processing(canvas, function(pjs) {
		pjs.setup = function() {
			pjs.size(world.width / scale, world.height / scale);

			pjs.frameRate(framerate);

			pjs.textAlign(pjs.CENTER, pjs.CENTER);
			pjs.textSize(14);

			// linear gradient
			Processing.Y_AXIS = 1;
			Processing.X_AXIS = 2;
			Processing.prototype.setGradient = function setGradient(x, y, w, h, c1, c2, axis) {
				pjs.noFill();

				if(axis === pjs.Y_AXIS) {	// Top to bottom gradient
					for (var i = y; i <= y + h; i++) {
						var inter = pjs.map(i, y, y + h, 0, 1);
						var c = pjs.lerpColor(c1, c2, inter);
						pjs.stroke(c);
						pjs.line(x, i, x + w, i);
					}
				} else if(axis === pjs.X_AXIS) {	// Left to right gradient
					for (var i = x; i <= x + w; i++) {
						var inter = pjs.map(i, x, x + w, 0, 1);
						var c = pjs.lerpColor(c1, c2, inter);
						pjs.stroke(c);
						pjs.line(i, y, i, y + h);
					}
				}
			};

			_this.backgroundGradient = pjs.createGraphics(world.width, world.height);
			_this.backgroundGradient.background(15, 37, 67);
			_this.backgroundGradient.setGradient(0, 0, world.width, world.height, pjs.color(17, 50, 77, 255), pjs.color(13, 25, 57, 255), Processing.Y_AXIS);
		};

		pjs.draw = function() {
			onRender();

			pjs.scale(1 / scale);
			// console.log(pjs.externals.context);

			// pjs.background(15, 37, 67);
			// pjs.setGradient(0, 0, world.width, world.height, pjs.color(17, 50, 77, 255), pjs.color(13, 25, 57, 255), pjs.Y_AXIS);
			pjs.image(_this.backgroundGradient, 0, 0);

			pjs.noStroke();
			pjs.smooth();

			for(var uid in world.cells) {
				var c = world.cells[uid];
				var r = Math.sqrt(c.mass);

				pjs.fill(c.color);
				pjs.ellipse(c.position[0], c.position[1], r * 2, r * 2);

				pjs.strokeWeight(1);
				pjs.noFill();
				for(var i = 0; i < Cell.GLOW_RADIUS; i++) {
					pjs.stroke(Cell.DEFAULT_COLOR & 0xffffff, 100 * (1 - Math.sqrt(i / Cell.GLOW_RADIUS)));
					pjs.ellipse(c.position[0], c.position[1], (r + i) * 2, (r + i) * 2);
				}

				var luminance = 1 - (0.299 * (c.color >>> 16) & 0xff + 0.587 * (c.color >>> 8) & 0xff + 0.114 * (c.color >>> 0) & 0xff) / 255;

				pjs.fill(luminance > 0.5 ? 0 : 255);
				pjs.text(c.name.charAt(0), c.position[0], c.position[1]);
			}
		};
	});
};
