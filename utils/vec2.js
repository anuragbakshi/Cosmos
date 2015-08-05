window.vec2 = {};

vec2.add = function(a, b) {
	return [a[0] + b[0], a[1] + b[1]];
};

vec2.sub = function(a, b) {
	return [a[0] - b[0], a[1] - b[1]];
};

vec2.scl = function(v, s) {
	return [v[0] * s, v[1] * s];
};

vec2.mag = function(v) {
	return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
};

vec2.norm = function(v) {
	return vec2.scl(v, 1 / vec2.mag(v));
};

vec2.rand = function() {
	var t = random.rand(0, 2 * Math.PI);

	return [Math.cos(t), Math.sin(t)];
}
