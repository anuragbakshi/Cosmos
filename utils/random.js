window.random = {};

random.rand = function(min, max) {
	return Math.random() * (max - min) + min;
}

random.randInt = function(min, max) {
	return Math.floor(random.rand(min, max + 1));
}
