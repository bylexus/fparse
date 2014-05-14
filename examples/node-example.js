var Formula = require('../fparser.js');

// Create a Formula object:
var f1 = new Formula('sin(PI+x)*y+z');

// Evaluate a single value:
var result = f1.evaluate({x: 5,y: 3, z: 2});
console.log(result);

// Evaluate an array of values:
var results = f1.evaluate([
	{x: 5,y: 3, z: 2},
	{x: 0, y: 2, z: 4},
	{x: 1/Math.PI,y:0.5,z:0}
]);
console.log(results);

// Get a single shot result set:
var singleResult = Formula.calc('sin(x)*cos(y)',[{x:0.5,y:0.2},{x:1,y:0.3}]);
console.log(singleResult);

// Create your own functions:
var f2 = new Formula('distance(a,t)');
f2.distance = function(a,t) {
	return (a/2)*t*t;
};
var dist = f2.evaluate({
	a: 9.81,
	t: 1
});
console.log(dist);

// Override an existing function once in a value object:
var f3 = new Formula('max(x,y)');

var res3 = f3.evaluate([
	{x: 1, y: 2	},
	{x: 4, y: 3	}, {
		x: 4,
		y: 5,
		max: function(x,y) { return x > y?x:y; }
	}]
);
console.log(res3);


// Get all used variables:
var f4 = new Formula('x*sin(PI*y) + y / (2-x*a) + z');
console.log(f4.getVariables());
