var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const MATH_CONSTANTS = {
  PI: Math.PI,
  E: Math.E,
  LN2: Math.LN2,
  LN10: Math.LN10,
  LOG2E: Math.LOG2E,
  LOG10E: Math.LOG10E,
  SQRT1_2: Math.SQRT1_2,
  SQRT2: Math.SQRT2
};
class Expression {
  static createOperatorExpression(operator, left, right) {
    if (operator === "^") {
      return new PowerExpression(left, right);
    }
    if (operator === "*" || operator === "/") {
      return new MultDivExpression(operator, left, right);
    }
    if (operator === "+" || operator === "-") {
      return new PlusMinusExpression(operator, left, right);
    }
    throw new Error(`Unknown operator: ${operator}`);
  }
  evaluate(params = {}) {
    throw new Error("Empty Expression - Must be defined in child classes");
  }
  toString() {
    return "";
  }
}
class BracketExpression extends Expression {
  constructor(expr) {
    super();
    __publicField(this, "innerExpression");
    this.innerExpression = expr;
    if (!(this.innerExpression instanceof Expression)) {
      throw new Error("No inner expression given for bracket expression");
    }
  }
  evaluate(params = {}) {
    return this.innerExpression.evaluate(params);
  }
  toString() {
    return `(${this.innerExpression.toString()})`;
  }
}
class ValueExpression extends Expression {
  constructor(value) {
    super();
    __publicField(this, "value");
    this.value = Number(value);
    if (isNaN(this.value)) {
      throw new Error("Cannot parse number: " + value);
    }
  }
  evaluate() {
    return this.value;
  }
  toString() {
    return String(this.value);
  }
}
class PlusMinusExpression extends Expression {
  constructor(operator, left, right) {
    super();
    __publicField(this, "operator");
    __publicField(this, "left");
    __publicField(this, "right");
    if (!["+", "-"].includes(operator)) {
      throw new Error(`Operator not allowed in Plus/Minus expression: ${operator}`);
    }
    this.operator = operator;
    this.left = left;
    this.right = right;
  }
  evaluate(params = {}) {
    if (this.operator === "+") {
      return this.left.evaluate(params) + this.right.evaluate(params);
    }
    if (this.operator === "-") {
      return this.left.evaluate(params) - this.right.evaluate(params);
    }
    throw new Error("Unknown operator for PlusMinus expression");
  }
  toString() {
    return `${this.left.toString()} ${this.operator} ${this.right.toString()}`;
  }
}
class MultDivExpression extends Expression {
  constructor(operator, left, right) {
    super();
    __publicField(this, "operator");
    __publicField(this, "left");
    __publicField(this, "right");
    if (!["*", "/"].includes(operator)) {
      throw new Error(`Operator not allowed in Multiply/Division expression: ${operator}`);
    }
    this.operator = operator;
    this.left = left;
    this.right = right;
  }
  evaluate(params = {}) {
    if (this.operator === "*") {
      return this.left.evaluate(params) * this.right.evaluate(params);
    }
    if (this.operator === "/") {
      return this.left.evaluate(params) / this.right.evaluate(params);
    }
    throw new Error("Unknown operator for MultDiv expression");
  }
  toString() {
    return `${this.left.toString()} ${this.operator} ${this.right.toString()}`;
  }
}
class PowerExpression extends Expression {
  constructor(base, exponent) {
    super();
    __publicField(this, "base");
    __publicField(this, "exponent");
    this.base = base;
    this.exponent = exponent;
  }
  evaluate(params = {}) {
    return Math.pow(this.base.evaluate(params), this.exponent.evaluate(params));
  }
  toString() {
    return `${this.base.toString()}^${this.exponent.toString()}`;
  }
}
class FunctionExpression extends Expression {
  constructor(fn, argumentExpressions, formulaObject = null) {
    super();
    __publicField(this, "fn");
    __publicField(this, "varPath");
    __publicField(this, "argumentExpressions");
    __publicField(this, "formulaObject");
    __publicField(this, "blacklisted");
    this.fn = fn != null ? fn : "";
    this.varPath = this.fn.split(".");
    this.argumentExpressions = argumentExpressions || [];
    this.formulaObject = formulaObject;
    this.blacklisted = void 0;
  }
  evaluate(params = {}) {
    var _a;
    params = params || {};
    const paramValues = this.argumentExpressions.map((a) => a.evaluate(params));
    try {
      let fn = getProperty(params, this.varPath, this.fn);
      if (fn instanceof Function) {
        return fn.apply(this, paramValues);
      }
    } catch (e) {
    }
    let objFn;
    try {
      objFn = getProperty((_a = this.formulaObject) != null ? _a : {}, this.varPath, this.fn);
    } catch (e) {
    }
    if (this.formulaObject && objFn instanceof Function) {
      if (this.isBlacklisted()) {
        throw new Error("Blacklisted function called: " + this.fn);
      }
      return objFn.apply(this.formulaObject, paramValues);
    }
    try {
      const mathFn = getProperty(Math, this.varPath, this.fn);
      if (mathFn instanceof Function) {
        return mathFn.apply(this, paramValues);
      }
    } catch (e) {
    }
    throw new Error("Function not found: " + this.fn);
  }
  toString() {
    return `${this.fn}(${this.argumentExpressions.map((a) => a.toString()).join(", ")})`;
  }
  isBlacklisted() {
    if (this.blacklisted === void 0) {
      this.blacklisted = Formula.functionBlacklist.includes(
        this.formulaObject ? this.formulaObject[this.fn] : null
      );
    }
    return this.blacklisted;
  }
}
function getProperty(object, path, fullPath) {
  let curr = object;
  for (let propName of path) {
    if (typeof curr !== "object") {
      throw new Error(`Cannot evaluate ${propName}, property not found (from path ${fullPath})`);
    }
    if (curr[propName] === void 0) {
      throw new Error(`Cannot evaluate ${propName}, property not found (from path ${fullPath})`);
    }
    curr = curr[propName];
  }
  if (typeof curr === "object") {
    throw new Error("Invalid value");
  }
  return curr;
}
class VariableExpression extends Expression {
  constructor(fullPath, formulaObj = null) {
    super();
    __publicField(this, "fullPath");
    __publicField(this, "varPath");
    __publicField(this, "formulaObject");
    this.formulaObject = formulaObj;
    this.fullPath = fullPath;
    this.varPath = fullPath.split(".");
  }
  evaluate(params = {}) {
    var _a;
    let value = void 0;
    try {
      value = getProperty(params, this.varPath, this.fullPath);
    } catch (e) {
    }
    if (value === void 0) {
      value = getProperty((_a = this.formulaObject) != null ? _a : {}, this.varPath, this.fullPath);
    }
    if (typeof value === "function" || typeof value === "object") {
      throw new Error(`Cannot use ${this.fullPath} as value: It contains a non-numerical value.`);
    }
    return Number(value);
  }
  toString() {
    return `${this.varPath.join(".")}`;
  }
}
const _Formula = class _Formula {
  /**
   * Creates a new Formula instance
   *
   * Optional configuration can be set in the options object:
   *
   * - memoization (bool): If true, results are stored and re-used when evaluate() is called with the same parameters
   *
   * @param {String} fStr The formula string, e.g. 'sin(x)/cos(y)'
   * @param {Object} options An options object. Supported options:
   *    - memoization (bool): If true, results are stored and re-used when evaluate() is called with the same parameters
   * @param {Formula} parentFormula Internally used to build a Formula AST
   */
  constructor(fStr, options = {}) {
    __publicField(this, "formulaExpression");
    __publicField(this, "options");
    __publicField(this, "formulaStr");
    __publicField(this, "_variables");
    __publicField(this, "_memory");
    this.formulaExpression = null;
    this.options = { ...{ memoization: false }, ...options };
    this.formulaStr = "";
    this._variables = [];
    this._memory = {};
    this.setFormula(fStr);
  }
  /**
   * Re-sets the given String and parses it to a formula expression. Can be used after initialization,
   * to re-use the Formula object.
   *
   * @param {String} formulaString The formula string to set/parse
   * @return {this} The Formula object (this)
   */
  setFormula(formulaString) {
    if (formulaString) {
      this.formulaExpression = null;
      this._variables = [];
      this._memory = {};
      this.formulaStr = formulaString;
      this.formulaExpression = this.parse(formulaString);
    }
    return this;
  }
  /**
   * Enable memoization: An expression is only evaluated once for the same input.
   * Further evaluations with the same input will return the in-memory stored result.
   */
  enableMemoization() {
    this.options.memoization = true;
  }
  /**
   * Disable in-memory memoization: each call to evaluate() is executed from scratch.
   */
  disableMemoization() {
    this.options.memoization = false;
    this._memory = {};
  }
  /**
   * Splits the given string by ',', makes sure the ',' is not within
   * a sub-expression
   * e.g.: str = "x,pow(3,4)" returns 2 elements: x and pow(3,4).
   */
  splitFunctionParams(toSplit) {
    let pCount = 0, paramStr = "";
    const params = [];
    for (let chr of toSplit.split("")) {
      if (chr === "," && pCount === 0) {
        params.push(paramStr);
        paramStr = "";
      } else if (chr === "(") {
        pCount++;
        paramStr += chr;
      } else if (chr === ")") {
        pCount--;
        paramStr += chr;
        if (pCount < 0) {
          throw new Error("ERROR: Too many closing parentheses!");
        }
      } else {
        paramStr += chr;
      }
    }
    if (pCount !== 0) {
      throw new Error("ERROR: Too many opening parentheses!");
    }
    if (paramStr.length > 0) {
      params.push(paramStr);
    }
    return params;
  }
  /**
   * Cleans the input string from unnecessary whitespace,
   * and replaces some known constants:
   */
  cleanupInputString(s) {
    s = s.replace(/\s+/g, "");
    Object.keys(MATH_CONSTANTS).forEach((c) => {
      s = s.replace(new RegExp(`\\b${c}\\b`, "g"), `[${c}]`);
    });
    return s;
  }
  /**
   * Parses the given formula string by using a state machine into a single Expression object,
   * which represents an expression tree (aka AST).
   *
   * First, we split the string into 'expression': An expression can be:
   *   - a number, e.g. '3.45'
   *   - an unknown variable, e.g. 'x'
   *   - a single char operator, such as '*','+' etc...
   *   - a named variable, in [], e.g. [myvar]
   *   - a function, such as sin(x)
   *   - a parenthessed expression, containing other expressions
   *
   * We want to create an expression tree out of the string. This is done in 2 stages:
   * 1. form single expressions from the string: parse the string into known expression objects:
   *   - numbers/variables
   *   - operators
   *   - braces (with a sub-expression)
   *   - functions (with sub-expressions (aka argument expressions))
   *   This will lead to an array of expressions.
   *  As an example:
   *  "2 + 3 * (4 + 3 ^ 5) * sin(PI * x)" forms an array of the following expressions:
   *  `[2, +, 3, *, bracketExpr(4,+,3,^,5), * , functionExpr(PI,*,x)]`
   * 2. From the raw expression array we form an expression tree by evaluating the expressions in the correct order:
   *    e.g.:
   *  the expression array `[2, +, 3, *, bracketExpr(4,+,3,^,5), * , functionExpr(PI,*,x)]` will be transformed into the expression tree:
   *  ```
   *         root expr:  (+)
   *                     / \
   *                    2    (*)
   *                        / \
   *                     (*)  functionExpr(...)
   *                     / \
   *                    3   (bracket(..))
   * ```
   *
   * In the end, we have a single root expression node, which then can be evaluated in the evaluate() function.
   *
   * @param {String} str The formula string, e.g. '3*sin(PI/x)'
   * @returns {Expression} An expression object, representing the expression tree
   */
  parse(str) {
    str = this.cleanupInputString(str);
    return this._do_parse(str);
  }
  /**
   * @see parse(): this is the recursive parse function, without the clean string part.
   * @param {String} str
   * @returns {Expression} An expression object, representing the expression tree
   */
  _do_parse(str) {
    let lastChar = str.length - 1, act = 0, state = "initial", expressions = [], char = "", tmp = "", funcName = null, pCount = 0;
    while (act <= lastChar) {
      switch (state) {
        case "initial":
          char = str.charAt(act);
          if (char.match(/[0-9.]/)) {
            state = "within-nr";
            tmp = "";
            act--;
          } else if (this.isOperator(char)) {
            if (char === "-") {
              if (expressions.length === 0 || this.isOperatorExpr(expressions[expressions.length - 1])) {
                state = "within-nr";
                tmp = "-";
                break;
              }
            }
            if (act === lastChar || this.isOperatorExpr(expressions[expressions.length - 1])) {
              state = "invalid";
              break;
            } else {
              expressions.push(
                Expression.createOperatorExpression(char, new Expression(), new Expression())
              );
              state = "initial";
            }
          } else if (char === "(") {
            state = "within-parentheses";
            tmp = "";
            pCount = 0;
          } else if (char === "[") {
            state = "within-named-var";
            tmp = "";
          } else if (char.match(/[a-zA-Z]/)) {
            if (act < lastChar && str.charAt(act + 1).match(/[a-zA-Z0-9_.]/)) {
              tmp = char;
              state = "within-func";
            } else {
              if (expressions.length > 0 && expressions[expressions.length - 1] instanceof ValueExpression) {
                expressions.push(
                  Expression.createOperatorExpression("*", new Expression(), new Expression())
                );
              }
              expressions.push(new VariableExpression(char, this));
              this.registerVariable(char);
              state = "initial";
              tmp = "";
            }
          }
          break;
        case "within-nr":
          char = str.charAt(act);
          if (char.match(/[0-9.]/)) {
            tmp += char;
            if (act === lastChar) {
              expressions.push(new ValueExpression(tmp));
              state = "initial";
            }
          } else {
            if (tmp === "-") {
              tmp = "-1";
            }
            expressions.push(new ValueExpression(tmp));
            tmp = "";
            state = "initial";
            act--;
          }
          break;
        case "within-func":
          char = str.charAt(act);
          if (char.match(/[a-zA-Z0-9_.]/)) {
            tmp += char;
          } else if (char === "(") {
            funcName = tmp;
            tmp = "";
            pCount = 0;
            state = "within-func-parentheses";
          } else {
            throw new Error("Wrong character for function at position " + act);
          }
          break;
        case "within-named-var":
          char = str.charAt(act);
          if (char === "]") {
            expressions.push(new VariableExpression(tmp, this));
            this.registerVariable(tmp);
            tmp = "";
            state = "initial";
          } else if (char.match(/[a-zA-Z0-9_.]/)) {
            tmp += char;
          } else {
            throw new Error("Character not allowed within named variable: " + char);
          }
          break;
        case "within-parentheses":
        case "within-func-parentheses":
          char = str.charAt(act);
          if (char === ")") {
            if (pCount <= 0) {
              if (state === "within-parentheses") {
                expressions.push(new BracketExpression(this._do_parse(tmp)));
              } else if (state === "within-func-parentheses") {
                let args = this.splitFunctionParams(tmp).map((a) => this._do_parse(a));
                expressions.push(new FunctionExpression(funcName, args, this));
                funcName = null;
              }
              state = "initial";
            } else {
              pCount--;
              tmp += char;
            }
          } else if (char === "(") {
            pCount++;
            tmp += char;
          } else {
            tmp += char;
          }
          break;
      }
      act++;
    }
    if (state !== "initial") {
      throw new Error("Could not parse formula: Syntax error.");
    }
    return this.buildExpressionTree(expressions);
  }
  /**
   * @see parse(): Builds an expression tree from the given expression array.
   * Builds a tree with a single root expression in the correct order of operator precedence.
   *
   * Note that the given expression objects are modified and linked.
   *
   * @param {*} expressions
   * @return {Expression} The root Expression of the built expression tree
   */
  buildExpressionTree(expressions) {
    if (expressions.length < 1) {
      throw new Error("No expression given!");
    }
    const exprCopy = [...expressions];
    let idx = 0;
    let expr = null;
    while (idx < exprCopy.length) {
      expr = exprCopy[idx];
      if (expr instanceof PowerExpression) {
        if (idx === 0 || idx === exprCopy.length - 1) {
          throw new Error("Wrong operator position!");
        }
        expr.base = exprCopy[idx - 1];
        expr.exponent = exprCopy[idx + 1];
        exprCopy[idx - 1] = expr;
        exprCopy.splice(idx, 2);
      } else {
        idx++;
      }
    }
    idx = 0;
    expr = null;
    while (idx < exprCopy.length) {
      expr = exprCopy[idx];
      if (expr instanceof MultDivExpression) {
        if (idx === 0 || idx === exprCopy.length - 1) {
          throw new Error("Wrong operator position!");
        }
        expr.left = exprCopy[idx - 1];
        expr.right = exprCopy[idx + 1];
        exprCopy[idx - 1] = expr;
        exprCopy.splice(idx, 2);
      } else {
        idx++;
      }
    }
    idx = 0;
    expr = null;
    while (idx < exprCopy.length) {
      expr = exprCopy[idx];
      if (expr instanceof PlusMinusExpression) {
        if (idx === 0 || idx === exprCopy.length - 1) {
          throw new Error("Wrong operator position!");
        }
        expr.left = exprCopy[idx - 1];
        expr.right = exprCopy[idx + 1];
        exprCopy[idx - 1] = expr;
        exprCopy.splice(idx, 2);
      } else {
        idx++;
      }
    }
    if (exprCopy.length !== 1) {
      throw new Error("Could not parse formula: incorrect syntax?");
    }
    return exprCopy[0];
  }
  isOperator(char) {
    return typeof char === "string" && char.match(/[+\-*/^]/);
  }
  isOperatorExpr(expr) {
    return expr instanceof PlusMinusExpression || expr instanceof MultDivExpression || expr instanceof PowerExpression;
  }
  registerVariable(varName) {
    if (this._variables.indexOf(varName) < 0) {
      this._variables.push(varName);
    }
  }
  getVariables() {
    return this._variables;
  }
  /**
   * Evaluates a Formula by delivering values for the Formula's variables.
   * E.g. if the formula is '3*x^2 + 2*x + 4', you should call `evaulate` as follows:
   *
   * evaluate({x:2}) --> Result: 20
   *
   * @param {ValueObject|Array<ValueObject>} valueObj An object containing values for variables and (unknown) functions,
   *   or an array of such objects: If an array is given, all objects are evaluated and the results
   *   also returned as array.
   * @return {Number|Array<Number>} The evaluated result, or an array with results
   */
  evaluate(valueObj) {
    if (valueObj instanceof Array) {
      return valueObj.map((v) => this.evaluate(v));
    }
    let expr = this.getExpression();
    if (!(expr instanceof Expression)) {
      throw new Error("No expression set: Did you init the object with a Formula?");
    }
    if (this.options.memoization) {
      let res = this.resultFromMemory(valueObj);
      if (res !== null) {
        return res;
      } else {
        res = expr.evaluate({ ...MATH_CONSTANTS, ...valueObj });
        this.storeInMemory(valueObj, res);
        return res;
      }
    }
    return expr.evaluate({ ...MATH_CONSTANTS, ...valueObj });
  }
  hashValues(valueObj) {
    return JSON.stringify(valueObj);
  }
  resultFromMemory(valueObj) {
    let key = this.hashValues(valueObj);
    let res = this._memory[key];
    if (res !== void 0) {
      return res;
    } else {
      return null;
    }
  }
  storeInMemory(valueObj, value) {
    this._memory[this.hashValues(valueObj)] = value;
  }
  getExpression() {
    return this.formulaExpression;
  }
  getExpressionString() {
    return this.formulaExpression ? this.formulaExpression.toString() : "";
  }
  static calc(formula, valueObj = null, options = {}) {
    valueObj = valueObj != null ? valueObj : {};
    return new _Formula(formula, options).evaluate(valueObj);
  }
};
__publicField(_Formula, "Expression", Expression);
__publicField(_Formula, "BracketExpression", BracketExpression);
__publicField(_Formula, "PowerExpression", PowerExpression);
__publicField(_Formula, "MultDivExpression", MultDivExpression);
__publicField(_Formula, "PlusMinusExpression", PlusMinusExpression);
__publicField(_Formula, "ValueExpression", ValueExpression);
__publicField(_Formula, "VariableExpression", VariableExpression);
__publicField(_Formula, "FunctionExpression", FunctionExpression);
__publicField(_Formula, "MATH_CONSTANTS", MATH_CONSTANTS);
// Create a function blacklist:
__publicField(_Formula, "functionBlacklist", Object.getOwnPropertyNames(_Formula.prototype).filter((prop) => _Formula.prototype[prop] instanceof Function).map((prop) => _Formula.prototype[prop]));
let Formula = _Formula;
export {
  Formula as default
};
//# sourceMappingURL=fparser.js.map
