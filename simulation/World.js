window.World = function(width, height) {
	this.width = width;
	this.height = height;

	this.cells = {};
};

World.prototype.step = function(dt) {
	var uids = Object.keys(this.cells);
	for(var i = 0; i < uids.length; i++) {
		var c = this.cells[uids[i]];
		c.update(this.width, this.height, dt);

		for(var j = i + 1; j < uids.length; j++) {
			var c2 = this.cells[uids[j]];
			var interacted = c.handleInteraction(c2);

			if(interacted && (c.isControlled || c2.isControlled)) {
				// scoreboardDirty = true;
			}
		}

		// c.render(pjs);
	}

	for(var i = uids.length - 1; i >= 0; i--) {
		if(this.cells[uids[i]].dead) {
			if(this.cells[uids[i]].isControlled) {
				// scoreboardDirty = true;
			}

			delete this.cells[uids[i]];
		}
	}
};
