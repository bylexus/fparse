# fparser

> A JavaScript Formula Parser

![Master Build](https://github.com/bylexus/fparse/actions/workflows/build.yml/badge.svg)
![Develop Build](https://github.com/bylexus/fparse/actions/workflows/build.yml/badge.svg?branch=develop)

fparser provides a Formula class that parses strings containing mathematical formulas (e.g. `x*sin(PI*x/2)`) into an evaluationable object.
One can then provide values for all unknown variables / functions and evaluate a numeric value from the formula.

For an example application, see https://fparser.alexi.ch/.

- [Features](#features)
- [Usage](#usage)
- [More options](#more-options)
	- [Using multiple variables](#using-multiple-variables)
	- [Using named variables](#using-named-variables)
	- [Using named object path variables](#using-named-object-path-variables)
	- [Using user-defined functions](#using-user-defined-functions)
	- [Using strings](#using-strings)
	- [Using logical operators](#using-logical-operators)
	- [Conditional evaluation](#conditional-evaluation)
	- [Re-use a Formula object](#re-use-a-formula-object)
	- [Memoization](#memoization)
	- [Blacklisted functions](#blacklisted-functions)
	- [Get all used variables](#get-all-used-variables)
	- [Get the parsed formula string](#get-the-parsed-formula-string)
- [Changelog](#changelog)
	- [3.1.0](#anchor-310)
	- [3.0.1](#anchor-301)
	- [3.0.0](#anchor-300)
	- [2.1.0](#anchor-210)
	- [2.0.2](#anchor-202)
	- [2.0.0](#anchor-200)
	- [1.4.0](#anchor-140)
	- [1.3.0](#anchor-130)
- [Contributors](#contributors)
- [TODOs, Whishlist](#todos-whishlist)
- [License](#license)


## Features

Parses a mathematical formula from a string. Known expressions:

-   _Numbers_ in the form [-]digits[.digits], e.g. "-133.2945"
-   _simple operators_: '+','-','\*','/', '^' expanded in correct order
-   _logical operators_: '<','<=','>','>=', '=', '!=', which evaluate to 1 or 0. Useful for implementing conditional logic
-   _parentheses_ '(', ')' for grouping (e.g. "5\*(3+2)")
-   all _JavaScript Math object functions_ (e.g. "sin(3.14)")
-   all _JavaScript Math constants_ like PI, E
-   the use of _own functions_
-   the use of single-char _variables_ (like '2x')
-   the use of named variables (like '2\*[myVar]')
-   the use of strings as function arguments (like 'concat("Size: ", 2, " mm")')
-   the use of strings as variables (like 'concat("Size: ", 2, " ", [unit])')
-   the use of path named variables and functions (like '2\*[myVar.property.innerProperty]')
-   _memoization_: store already evaluated results for faster re-calcs
-   use it in Web pages, as ES6 module or as NodeJS module
-   Example:<br /> <code>-1*(sin(2^x)/(PI*x))\*cos(x)</code>

## Usage

Include directly in your web page:

```html
<!-- Within a web page: Load the fparser library: -->
<script src="dist/fparser.js"></script>
<script>const f = new Formula('x+3');</script>
```

Install it from npmjs.org:

```shell
# Install it using npm:
$ npm install --save fparser
```

Then use as ES6 module (recommended):

```javascript
import Formula from 'fparser';
```

or use it as UMD module:

```javascript
const Formula = require('fparser');
```

... and finally use it:

```javascript
// 1. Create a Formula object instance by passing a formula string:
const fObj = new Formula('2^x');

// 2. evaluate the formula, delivering a value object for each unknown entity:
let result = fObj.evaluate({ x: 3 }); // result = 8

// or deliver multiple value objects to return multiple results:
let results = fObj.evaluate([{ x: 2 }, { x: 4 }, { x: 8 }]); // results = [4,16,256]

// You can also directly evaluate a value if you only need a one-shot result:
let result = Formula.calc('2^x', { x: 3 }); // result = 8
let results = Formula.calc('2^x', [{ x: 2 }, { x: 4 }, { x: 8 }]); // results = [4,16,256]
```

## More options

### Using multiple variables

```javascript
const fObj = new Formula('a*x^2 + b*x + c');

// Just pass a value object containing a value for each unknown variable:
let result = fObj.evaluate({ a: 2, b: -1, c: 3, x: 3 }); // result = 18
```

### Using named variables

Instead of single-char variables (like `2x+y`), you can also use named variables in brackets:

```javascript
const fObj = new Formula('2*[var1] + sin([var2]+PI)');

// Just pass a value object containing a value for each named variable:
let result = fObj.evaluate({ var1: 5, var2: 0.7 });
```

The reason for the bracket syntax is the support of shortcut multiplication of single vars, e.g. `2xy` is a shorthand for `2*x*y`. As the parser cannot decide if `xy` means "the variable named `xy", or `calc x*y`, we had to introduce the
bracket syntax.

### Using named object path variables

Named variables in brackets can also describe an object property path:

```javascript
const fObj = new Formula('2*[var1.propertyA] + 3*[var2.propertyB.propertyC]');

// Just pass a value object containing a value for each named variable:
let result = fObj.evaluate({ var1: { propertyA: 3 }, var2: { propertyB: { propertyC: 9 } } });
```

This even works for array values: Instead of the property name, use a 0-based index in an array:

```javascript
// var2.propertyB is an array, so we can use an index for the 3rd entry of propertyB:
const fObj = new Formula('2*[var1.propertyA] + 3*[var2.propertyB.2]');
let result = fObj.evaluate({ var1: { propertyA: 3 }, var2: { propertyB: [2, 4, 6] } });
```

### Using user-defined functions

```javascript
const fObj = new Formula('sin(inverse(x))');

//Define the function(s) on the Formula object, then use it multiple times:
fObj.inverse = (value) => 1/value;
let results = fObj.evaluate([{ x: 1 }, { x: 2 }, { x: 3 }]);

// Or pass it in the value object, and OVERRIDE an existing function:
let result = fObj.evaluate({
	x: 2/Math.PI,
	inverse: (value) =>  (-1*value)
});

```

If the function is defined in the value object AND on the formula object, the Value object has precedence

Functions also support the object path syntax:

```javascript
// in an evaluate() value object:
const fObj = new Formula('sin(lib.inverse([lib.x]))');
const res = fObj.evaluate({
	lib: { inverse: (value) => 1 / value, x: Math.PI }
});

// or set it on the Formula instance:
const fObj2 = new Formula('sin(lib.inverse(x))');
fObj2.lib = { inverse: (value) => 1 / value };
const res2 = fObj2.evaluate({ x: Math.PI });
```

### Using strings

You can also pass strings as values or variable values (not only numbers): It is then in your responsibility to
provide a function that can make sense of the string:

E.g. you can create a function that concats 2 values:

```javascript
const fObj = new Formula('concat([var1], "Bar")');
let result = fObj.evaluate({ var1: 'Foo', concat: (s1, s2) => s1 + s2 });
```

Here, the result of the evaluation is again a string.

Of course you can use strings to make decisions: Here, we provide a function `longer` that
returns the length of the longer of two strings, and calculates the remaining length:

```javascript
const fObj = new Formula('20 - longer([var1], "Bar")');
let result = fObj.evaluate({ var1: 'FooBar', longer: (s1, s2) => s1.length > s2.length ? s1.length : s2.length });
// --> 14
```

### Using logical operators

Logical operators allow for conditional logic. The result of the evaluation is always `0` (expression is false) or `1` (expression is true).

Example:

Calculate a percentage value based on a variable `x`, but only if `x` is between 0 and 1:

```javascript
const fObj = new Formula('(x >= 0) * (x <= 1) * x * 100');
let result = fObj.evaluate([{ x: 0.5 }, { x: 0.7 }, { x: 1.5 },  { x: -0.5 }, { x: -1.7 }]);
// --> [50, 70, 0, 0, 0]
```

This could be used to simulate or "shortcut" comparison functions. The same could be achieved with a user-definded function:

```javascript
const fObj = new Formula('withinOne(x) * 100');
fObj.withinOne = (x) => (x >= 0 && x <= 1 ? x : 0);
let result = fObj.evaluate([{ x: 0.5 }, { x: 0.7 }, { x: 1.5 },  { x: -0.5 }, { x: -1.7 }]);
// --> [50, 70, 0, 0, 0]
```

**NOTE**: Logical operators have the LEAST precedence: `3 > 1 + 4 < 2` is evaluated as `3 > (1+4) < 2`.

### Conditional evaluation

The previous chapter introduced logical operators. This can be used to implement a conditional function, or `if` function:

Example: Kids get a 50% discount on a price if they are under 18:

```javascript
const fObj = new Formula('ifElse([age] < 18, [price]*0.5, [price])');
fObj.ifElse = (predicate, trueValue, falseValue) => (predicate ? trueValue : falseValue);
const res = fObj.evaluate([{ price: 100, age: 17 }, { price: 100, age: 20 }]);
// --> res = [50, 100]
```


### Re-use a Formula object

You can instantiate a Formula object without formula, and set it later, and even re-use the existing object:

```javascript
const fObj = new Formula();
// ...
fObj.setFormula('2*x^2 + 5*x + 3');
let res = fObj.evaluate({ x: 3 });
// ...
fObj.setFormula('x*y');
res = fObj.evaluate({ x: 2, y: 4 });
```

### Memoization

To avoid re-calculation of already evaluated results, the formula parser object supports **memoization**:
it stores already evaluated results for given expression parameters.

Example:

```javascript
const fObj = new Formula('x * y', { memoization: true });
let res1 = fObj.evaluate({ x: 2, y: 3 }); // 6, evaluated by calculating x*y
let res2 = fObj.evaluate({ x: 2, y: 3 }); // 6, from memory
```

You can enable / disable memoization on the object:

```javascript
const fObj = new Formula('x * y');
let res1 = fObj.evaluate({ x: 2, y: 3 }); // 6, evaluated by calculating x*y
fObj.enableMemoization();
let res2 = fObj.evaluate({ x: 2, y: 3 }); // 6, evaluated by calculating x*y
let res3 = fObj.evaluate({ x: 2, y: 3 }); // 6, from memory
```

### Blacklisted functions

The `Formula` class blacklists its internal functions like `evaluate`, `parse` etc. You cannot create a formula that calls an internal `Formula`
function:

```javascript
// Internal functions cannot be used in formulas:
const fObj = new Formula('evaluate(x)');
fObj.evaluate({ x: 5 }); // throws an Error

// This also counts for function aliases / references to internal functions:
const fObj = new Formula('ex(x)');
fObj.ex = fObj.evaluate;
fObj.evaluate({ x: 5 }); // still throws an Error: ex is an alias of evaluate
```

The `Formula` object keeps a function reference of all blacklisted functions in the `Formula.functionBlacklist` array.

You can get a list of all blacklisted functions:

```javascript
let blacklistNames = Formula.functionBlacklist.map((f) => f.name));
```

Or you can check if a specific function is in the blacklist:

```javascript
fObj = new Formula('x * y');
// fObj.evaluate is a Function pointer to an internal, blacklisted function:
Formula.functionBlacklist.includes(fObj.evaluate);
```

If you want to provide your own function for a blacklisted internal function,
provide it with the `evaluate` function:

```javascript
fObj = new Formula('evaluate(x * y)');
fObj.evaluate({ x: 1, y: 2, evaluate: (x, y) => x + y });
```

Now, `evaluate` in your formula uses your own version of this function.

### Get all used variables

```javascript
// Get all used variables in the order of their appearance:
const f4 = new Formula('x*sin(PI*y) + y / (2-x*[var1]) + [var2]');
console.log(f4.getVariables()); // ['x','PI','y','var1','var2']
```

### Get the parsed formula string

After parsing, get the formula string as parsed:

```javascript
// Get all used variables in the order of their appearance:
const f = new Formula('x      * (  y  +    9 )');
console.log(f.getExpressionString()); // 'x * (y + 9)'
```

## Changelog

### 3.1.0

- [Feature] Adding Logical Operators `<`, `>`, `<=`, `>=`, `=`, `!=`

### 3.0.1

- [Bugfix] Fixing `main` entry in `package.json`: The 3.0.0 build could not be used as ES 6 module import with the non-existing main entry.

### 3.0.0

This is a long-wanted "migrate to typescript and modernize build infrastrucure" release. 
It introduces some *few* breaking changes, which hopefully are simple to adapt in existing code, or does not affect end users at all (I hope).

- [Breaking]: new build system (vitejs instead of webpack)
- [Breaking]: UMD module version available as `dist/fparser.umd.js` instead of `dist/fparser.js`: If you need the UMD version, use `dist/fparser.umd.js` instead of `dist/fparser.js`.
- [Breaking]: An empty formula now throws an Error when parsed.
- [Breaking]: `VariableExpression` class now needs Formula instance in constructor. This should not affect any end-user, but I did not test all edge cases.
- [Change]: Migrating source code to TypeScript. This should not affect end-users.
- [Feature]: Variables and functions now both support object paths (e.g. `obj.fn(3*[obj.value])`)

### 2.1.0

- [Breaking]: Blacklisting internal functions: You cannot use internal functions as formula function anymore.
- [Feature]: Supporting object paths as variable values (e.g. `3*[obj1.property1.innerProperty]`), thanks to [SamStonehouse](https://github.com/SamStonehouse)
- [Change]: Updated build infrastructure: upped versions of build tools

### 2.0.2

-   Fixing Issue #22: If the formula started with a single negate variable (e.g. `-z*t`), the parser got confused.

### 2.0.0

This release is a complete re-vamp, see below. it **should** be completely backward compatible to the 1.x versions, but I did not test all
edge cases.

-   Switched to MIT license
-   complete refactoring of the parsing and evaluating part: The parser now creates an Expression Tree (AST) that saves extra time while evaluating - Evaluation now only traverses the AST, which is much faster.
-   added `getExpressionString()` function to get a formatted string from the formula
-   adding support for memoization: store already evaluated results
-   Switched bundler to webpack
-   fixed some parser bugs

### 1.4.0

-   Adding support for named variables (`2x + [var1]`)
-   switched testing to chromium runner instead of PhantomJS

### 1.3.0

-   modernized library: The source is now ES6 code, and transpiled in a dist ES5+ library.
-   Make sure you include dist/fparser.js if you are using it as a browser library.
-   Drop support for Bower, as there are more modern approaches (npm) for package dependency nowadays

## Contributors

Thanks to all the additional contributors:

- [LuigiPulcini](https://github.com/LuigiPulcini) for:
  - the Strings support
  - the Logical Operator support

## TODOs, Whishlist

* [ ] support for double- and single quote strings (now: only double quotes)
* [ ] make parser state names via enum, instead of error-prone strings
* [ ] Implement standard logic functions:
	* [ ] `and(...args)`: if all given arguments are trueish (> 0), then the last arg is returned as value
	* [ ] `or(...args)`: the first trueish (> 0) arg is returned as value
	* [ ] `ifElse(predicate, trueValue, falseValue)`: returns the trueValue if the predicate is trueish (> 0), else the falseValue is returned
* [ ] Refactor / rebuild parser:
  * separate tokenize step
  * then use Djikstra's Shunting Yard algorithm to convert the Inifix notation to Postfix, which is
    way simpler to execute (See https://en.wikipedia.org/wiki/Shunting_yard_algorithm)

## License

Licensed under the MIT license, see LICENSE file.
