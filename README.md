fparse
======

> A JavaScript Formula Parser

fparse provides a Formula class that parses strings containing mathematical formulas (e.g. `x*sin(PI*x/2)`) into an evaluationable object.
One can then provide values for all unknown variables / functions and evaluate a numeric value from the formula.

For an example application, see http://fparse.alexi.ch/.

Features
---------

Parses a mathematical formula from a string. Known expressions:

* *Numbers* in the form [-]digits[.digits], e.g. "-133.2945"
* *simple operators*: '+','-','*','/', '^' expanded in correct order
* *parentheses* '(', ')' for grouping (e.g. "5*(3+2)")
* all *JavaScript Math object functions* (e.g. "sin(3.14)")
* all *JavaScript Math constants* like PI, E
* the use of *own functions*
* the use of *variables*
* use it in Web pages and as Node module
* Example:<br /> <code>-1*(sin(2^x)/(PI*x))*cos(x))</code>


Usage
------

```html
<!-- Within a web page: Load the fparse library: -->
<script src="fparser.js"></script>
```

```javascript
// As node module:
var Formula = require('./fparser');
```

```javascript
// 1. Create a Formula object instance by passing a formula string:
var fObj = new Formula('2^x');

// 2. evaluate the formula, delivering a value object for each unknown entity:
var result = fObj.evaluate({x: 3}); // result = 8

// or deliver multiple value objects to return multiple results:
var results = fObj.evaluate([{x: 2},{x: 4},{x: 8}]); // results = [4,16,256]

// You can also directly evaluate a value if you only need a one-shot result:
var result = Formula.calc('2^x',{x: 3}); // result = 8
var results = fObj.calc('2^x',[{x: 2},{x: 4},{x: 8}]); // results = [4,16,256]

// Usage in NodeJS:
var Formula = require('./fparser');
var fObj = new Formula('2^x)');
// .... vice versa
```

Advanced Usage
--------------

### Using multiple variables
```javascript
var fObj = new Formula('a*x^2 + b*x + c');

// Just pass a value object containing a value for each unknown variable:
var result = fObj.evaluate({a:2,b:-1,c:3,x:3}); // result = 18
```

### Using user-defined functions
```javascript
var fObj = new Formula('sin(inverse(x))');

//Define the function(s) on the Formula object, then use it multiple times:
fObj.inverse = function(value){
    return 1/value;
};
var results = fObj.evaluate({x: 1,x:2,x:3});

// Or pass it in the value object, and OVERRIDE an existing function:
var result = fObj.evaluate({
	x: 2/Math.PI, 
	inverse: function(value){
		return -1*value;
	}
});

If defined in the value object AND on the formula object, the Value object has the precedence
```

### Get all used variables
```javascript
// Get all used variables in the order of their appereance:
var f4 = new Formula('x*sin(PI*y) + y / (2-x*a) + z');
console.log(f4.getVariables()); // ['x','y','a','z']
