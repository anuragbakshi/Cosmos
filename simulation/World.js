window.World = function(width, height, onPlayerUpdate) {
	this.width = width;
	this.height = height;

	this.onPlayerUpdate = onPlayerUpdate !== undefined ? onPlayerUpdate : function() {};

	this.cells = {};
};

World.prototype.step = function(dt) {
	var playerUpdated = false;

	var uids = Object.keys(this.cells);
	for(var i = 0; i < uids.length; i++) {
		var c = this.cells[uids[i]];
		c.update(this.width, this.height, dt);

		for(var j = i + 1; j < uids.length; j++) {
			var c2 = this.cells[uids[j]];
			var interacted = c.handleInteraction(c2);

			if(interacted && (c.isControlled || c2.isControlled)) {
				playerUpdated = true;
			}
		}
	}

	for(var i = uids.length - 1; i >= 0; i--) {
		if(this.cells[uids[i]].dead) {
			if(this.cells[uids[i]].isControlled) {
				playerUpdated = true;
			}

			delete this.cells[uids[i]];
		}
	}

	if(playerUpdated) {
		this.onPlayerUpdate();
	}
};

World.prototype.addCell = function(c) {
	this.cells[c.uid] = c;

	if(c.isControlled) {
		this.onPlayerUpdate();
	}
};

World.prototype.handleMessage = function(message) {
	if(message.desc === "input") {
		var c = this.cells[message.uid];

		var cEjected = c.ejectMass(message.impulse);
		this.addCell(cEjected);
	}
};
