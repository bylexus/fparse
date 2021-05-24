# fparser

> A JavaScript Formula Parser

![Master Build](https://github.com/bylexus/fparse/actions/workflows/build.yml/badge.svg)
![Develop Build](https://github.com/bylexus/fparse/actions/workflows/build.yml/badge.svg?branch=develop)

fparser provides a Formula class that parses strings containing mathematical formulas (e.g. `x*sin(PI*x/2)`) into an evaluationable object.
One can then provide values for all unknown variables / functions and evaluate a numeric value from the formula.

For an example application, see https://fparser.alexi.ch/.

## Features

Parses a mathematical formula from a string. Known expressions:

* *Numbers* in the form [-]digits[.digits], e.g. "-133.2945"
* *simple operators*: '+','-','*','/', '^' expanded in correct order
* *parentheses* '(', ')' for grouping (e.g. "5*(3+2)")
* all *JavaScript Math object functions* (e.g. "sin(3.14)")
* all *JavaScript Math constants* like PI, E
* the use of *own functions*
* the use of single-char *variables* (like '2x')
* the use of named variables (like '2*[myVar]')
* *memoization*: store already evaluated results for faster re-calcs
* use it in Web pages, as ES6 module or as NodeJS module
* Example:<br /> <code>-1*(sin(2^x)/(PI*x))*cos(x))</code>


## Usage

```html
<!-- Within a web page: Load the fparser library: -->
<script src="dist/fparser.js"></script>
```

```javascript
// As node module:
Install:
$ npm install --save fparser

Use:
const Formula = require('fparser');

or:
import Formula from 'fparser';
```

```javascript
// 1. Create a Formula object instance by passing a formula string:
const fObj = new Formula('2^x');

// 2. evaluate the formula, delivering a value object for each unknown entity:
let result = fObj.evaluate({x: 3}); // result = 8

// or deliver multiple value objects to return multiple results:
let results = fObj.evaluate([{x: 2},{x: 4},{x: 8}]); // results = [4,16,256]

// You can also directly evaluate a value if you only need a one-shot result:
let result = Formula.calc('2^x',{x: 3}); // result = 8
let results = Formula.calc('2^x',[{x: 2},{x: 4},{x: 8}]); // results = [4,16,256]

// Usage in NodeJS:
const Formula = require('fparser');
const fObj = new Formula('2^x)');
// .... vice versa
```

## More options

### Using multiple variables
```javascript
const fObj = new Formula('a*x^2 + b*x + c');

// Just pass a value object containing a value for each unknown variable:
let result = fObj.evaluate({a:2,b:-1,c:3,x:3}); // result = 18
```

### Using named variables

Instead of single-char variables (like `2x+y`), you can also use named variables in brackets:
```javascript
const fObj = new Formula('2*[var1] + sin([var2]+PI)');

// Just pass a value object containing a value for each named variable:
let result = fObj.evaluate({var1: 5, var2: 0.7});
```

### Using user-defined functions
```javascript
const fObj = new Formula('sin(inverse(x))');

//Define the function(s) on the Formula object, then use it multiple times:
fObj.inverse = (value) => 1/value;
let results = fObj.evaluate({x: 1,x:2,x:3});

// Or pass it in the value object, and OVERRIDE an existing function:
let result = fObj.evaluate({
	x: 2/Math.PI,
	inverse: (value) =>  (-1*value)
});

If defined in the value object AND on the formula object, the Value object has the precedence
```

### Re-use a Formula object

You can instantiate a Formula object without formula, and set it later, and even re-use the existing object:

```javascript
const fObj = new Formula();
// ...
fObj.setFormula('2*x^2 + 5*x + 3');
let res = fObj.evaluate({x:3});
// ...
fObj.setFormula('x*y');
res = fObj.evaluate({x:2, y:4});
```

### Memoization

To avoid re-calculation of already evaluated results, the formula parser object supports **memoization**:
it stores already evaluated results for given expression parameters.

Example:

```javascript
const fObj = new Formula('x * y', {memoization: true});
let res1 = fObj.evaluate({x:2, y:3}); // 6, evaluated by calculating x*y
let res2 = fObj.evaluate({x:2, y:3}); // 6, from memory
```

You can enable / disable memoization on the object:
```javascript
const fObj = new Formula('x * y');
let res1 = fObj.evaluate({x:2, y:3}); // 6, evaluated by calculating x*y
fObj.enableMemoization();
let res2 = fObj.evaluate({x:2, y:3}); // 6, evaluated by calculating x*y
let res3 = fObj.evaluate({x:2, y:3}); // 6, from memory
```

### Get all used variables
```javascript
// Get all used variables in the order of their appereance:
const f4 = new Formula('x*sin(PI*y) + y / (2-x*[var1]) + [var2]');
console.log(f4.getVariables()); // ['x','y','var1','var2']
```

### Get the parsed formula string

After parsing, get the formula string as parsed:

```javascript
// Get all used variables in the order of their appereance:
const f = new Formula('x      * (  y  +    9 )');
console.log(f.getExpressionString()); // 'x * (y + 9)'
```

## Changelog

### 2.0.0

This release is a complete re-vamp, see below. it **should** be completely backward compatible to the 1.x versions, but I did not test all
edge cases.

* Switched to MIT license
* complete refactoring of the parsing and evaluating part: The parser now creates an Expression Tree (AST) that saves extra time while evaluating - Evaluation now only traverses the AST, which is much faster.
* added `getExpressionString()` function to get a formatted string from the formula
* adding support for memoization: store already evaluated results
* Switched bundler to webpack
* fixed some parser bugs


### 1.4.0

* Adding support for named variables (`2x + [var1]`)
* switched testing to chromium runner instead of PhantomJS

### 1.3.0

* modernized library: The source is now ES6 code, and transpiled in a dist ES5+ library.
* Make sure you include dist/fparser.js if you are using it as a browser library.
* Drop support for Bower, as there are more modern approaches (npm) for package dependency nowadays

License
----------

Licensed under the MIT license, see LICENSE file.

