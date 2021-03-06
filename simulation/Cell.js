window.Cell = function(position, velocity, mass, name, color, isControlled) {
	this.position = position;
	this.velocity = velocity;
	this.mass = mass;

	this.name = name !== undefined ? name : "";
	// this.color = (0xff << 24) | parseInt((color !== undefined ? color : Cell.DEFAULT_COLOR).substring(1), 16);	// rgb(182,200,239)
	this.color = color !== undefined ? ((0xff << 24) | parseInt((color).substring(1), 16)) : Cell.DEFAULT_COLOR;	// rgb(182,200,239)

	this.isControlled = isControlled !== undefined ? isControlled : false;

	this.dead = false;
	this.uid = Cell.uidCounter++;
};

Cell.PLAYER_START_MASS = 1000;
Cell.EJECTION_VELOCITY = 0.075;
Cell.DEFAULT_COLOR = 0xffb6c8ef;
Cell.GLOW_RADIUS = 8;
Cell.uidCounter = 0;

Cell.prototype.update = function(width, height, dt) {
	if(this.dead) {
		return;
	}

	var r = Math.sqrt(this.mass);

	// apply velocity
	this.position = vec2.add(this.position, vec2.scl(this.velocity, dt));

	// bounce off edges
	if(this.position[0] - r < 0 || this.position[0] + r > width) {
		this.velocity[0] *= -1;
		this.position[0] = Math.max(r, Math.min(this.position[0], width - r));
	}

	if(this.position[1] - r < 0 || this.position[1] + r > height) {
		this.velocity[1] *= -1;
		this.position[1] = Math.max(r, Math.min(this.position[1], height - r));
	}
};

Cell.prototype.ejectMass = function(impulse) {
	if(this.mass < 10) {
		return;
	}

	var r = Math.sqrt(this.mass);

	var ejectedMass = vec2.mag(impulse) / Cell.EJECTION_VELOCITY;

	this.mass -= ejectedMass;
	this.velocity = vec2.add(this.velocity, vec2.scl(impulse, 1 / this.mass));

	// console.log(vec2.add(this.position, vec2.scl(vec2.norm(impulse), -r)));
	return new Cell(
		vec2.add(this.position, vec2.scl(vec2.norm(impulse), -1.25 * (r + Math.sqrt(ejectedMass)))),
		vec2.add(this.velocity, vec2.scl(vec2.norm(impulse), -Cell.EJECTION_VELOCITY)),
		ejectedMass
	);
};

Cell.prototype.split = function() {
	return this.ejectMass(vec2.scl(vec2.rand(), random.rand(0.4, 0.6) * this.mass * Cell.EJECTION_VELOCITY));
};

Cell.prototype.handleInteraction = function(other) {
	if(other.dead) {
		return false;
	}

	// check for collision
	var cSmall, cLarge;
	if(this.mass < other.mass) {
		cSmall = this;
		cLarge = other;
	} else {
		cSmall = other;
		cLarge = this;
	}

	var rSmall = Math.sqrt(cSmall.mass);
	var rLarge = Math.sqrt(cLarge.mass);

	var d = vec2.mag(vec2.sub(cSmall.position, cLarge.position));

	if(d < rSmall + rLarge) { // some collision
		var dm;

		if(d < rLarge) { // full absorbtion
			dm = cSmall.mass;
			cSmall.dead = true;
		} else { // partial absorbtion
			dm = (d * Math.sqrt(2 * (cSmall.mass + cLarge.mass) - d * d) + cSmall.mass - cLarge.mass) / 2;
		}

		// calculate momentum transferred (impulse)
		var pSmall = vec2.scl(cSmall.velocity, cSmall.mass);
		var pLarge = vec2.scl(cLarge.velocity, cLarge.mass);

		var dp = vec2.scl(cSmall.velocity, dm);

		cSmall.mass -= dm;
		cLarge.mass += dm;

		cSmall.velocity = vec2.scl(vec2.sub(pSmall, dp), 1 / cSmall.mass);
		cLarge.velocity = vec2.scl(vec2.add(pLarge, dp), 1 / cLarge.mass);

		return true;
	}

	return false;
};
