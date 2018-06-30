fparser [![Build Status](https://travis-ci.com/bylexus/fparse.svg?branch=master)](https://travis-ci.com/bylexus/fparse)
=======

> A JavaScript Formula Parser


fparser provides a Formula class that parses strings containing mathematical formulas (e.g. `x*sin(PI*x/2)`) into an evaluationable object.
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
* the use of single-char *variables* (like '2x')
* the use of named variables (like '2*[myVar]')
* use it in Web pages, as ES6 module or as NodeJS module
* Example:<br /> <code>-1*(sin(2^x)/(PI*x))*cos(x))</code>


Usage
------

```html
<!-- Within a web page: Load the fparser library: -->
<script src="dist/fparser.js"></script>
```

```javascript
// As node module:
Install:
$ npm install --save fparser

Use:
var Formula = require('./fparser');

or:
import Formula from 'fparser';
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

### Using named variables

Instead of single-char variables (like `2x+y`), you can also use named variables in brackets:
```javascript
var fObj = new Formula('2*[var1] + sin([var2]+PI)');

// Just pass a value object containing a value for each named variable:
var result = fObj.evaluate({var1: 5, var2: 0.7});
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
var f4 = new Formula('x*sin(PI*y) + y / (2-x*[var1]) + [var2]');
console.log(f4.getVariables()); // ['x','y','var1','var2']
```

Changelog
-----------

### 1.4.0

  * Adding support for named variables (`2x + [var1]`)
  * switched testing to chromium runner instead of PhantomJS

### 1.3.0
  * modernized library: The source is now ES6 code, and transpiled in a dist ES5+ library.
  * Make sure you include dist/fparser.js if you are using it as a browser library.
  * Drop support for Bower, as there are more modern approaches (npm) for package dependency nowadays

