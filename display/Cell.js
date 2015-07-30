window.Cell = function(position, velocity, mass, name, color) {
	this.position = position;
	this.velocity = velocity;
	this.mass = mass;

	this.name = name ? name !== undefined : "";
	this.color = color ? color !== undefined : "#646464";

	this.dead = false;
	this.uid = Cell.uidCounter++;
}

Cell.EJECTION_VELOCITY = 0.2;
Cell.uidCounter = 0;

Cell.prototype.update = function(pjs, dt) {
	if(this.dead) {
		return;
	}

	var r = Math.sqrt(this.mass);

	// apply velocity
	this.position = vec2.add(this.position, vec2.scl(this.velocity, dt));

	// bounce off edges
	if(this.position[0] - r < 0 || this.position[0] + r > pjs.width) {
		this.velocity[0] *= -1;
		this.position[0] = Math.max(r, Math.min(this.position[0], pjs.width - r));
	}

	if(this.position[1] - r < 0 || this.position[1] + r > pjs.height) {
		this.velocity[1] *= -1;
		this.position[1] = Math.max(r, Math.min(this.position[1], pjs.height - r));
	}
};

Cell.prototype.render = function(pjs) {
	var r = Math.sqrt(this.mass);
	pjs.ellipse(this.position[0], this.position[1], r * 2, r * 2);
}

Cell.prototype.ejectMass = function(impulse) {
	var r = Math.sqrt(this.mass);

	var ejectedMass = vec2.mag(impulse) / Cell.EJECTION_VELOCITY;

	this.mass -= ejectedMass;
	this.velocity = vec2.add(this.velocity, vec2.scl(impulse, 1 / this.mass));

	// console.log(vec2.add(this.position, vec2.scl(vec2.norm(impulse), -r)));
	return new Cell(
		vec2.add(this.position, vec2.scl(vec2.norm(impulse), -r)),
		vec2.scl(vec2.norm(impulse), -Cell.EJECTION_VELOCITY),
		ejectedMass
	);
}

Cell.prototype.handleInteraction = function(other) {
	if(other.dead) {
		return;
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
	}
};
