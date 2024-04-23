var P = Object.defineProperty;
var O = (h, r, e) => r in h ? P(h, r, { enumerable: !0, configurable: !0, writable: !0, value: e }) : h[r] = e;
var n = (h, r, e) => (O(h, typeof r != "symbol" ? r + "" : r, e), e);
const E = {
  PI: Math.PI,
  E: Math.E,
  LN2: Math.LN2,
  LN10: Math.LN10,
  LOG2E: Math.LOG2E,
  LOG10E: Math.LOG10E,
  SQRT1_2: Math.SQRT1_2,
  SQRT2: Math.SQRT2
};
class p {
  static throwIfNotNumber(r) {
    if (typeof r === "string")
      throw new Error("Strings are not allowed in math operations");
  }
}
class $ {
  static throwIfNotNumber(r) {
    if (typeof r === "string")
      throw new Error("Strings are not allowed in math operations");
  }
}
class u {
  static createOperatorExpression(r, e, t) {
    if (r === "^")
      return new x(e, t);
    if (r === "*" || r === "/")
      return new b(r, e, t);
    if (r === "+" || r === "-")
      return new g(r, e, t);
    throw new Error(`Unknown operator: ${r}`);
  }
  evaluate(r = {}) {
    throw new Error("Empty Expression - Must be defined in child classes");
  }
  toString() {
    return "";
  }
}
class N extends u {
  constructor(e) {
    super();
    n(this, "innerExpression");
    if (this.innerExpression = e, !(this.innerExpression instanceof u))
      throw new Error("No inner expression given for bracket expression");
  }
  evaluate(e = {}) {
    return this.innerExpression.evaluate(e);
  }
  toString() {
    return `(${this.innerExpression.toString()})`;
  }
}
class w extends u {
  constructor(e, t = "number") {
    super();
    n(this, "value");
    n(this, "type");
    switch (this.value = Number(e), t) {
      case "number":
        if (this.value = Number(e), isNaN(this.value))
          throw new Error("Cannot parse number: " + e);
        break;
      case "string":
        this.value = String(e);
        break;
      default:
        throw new Error("Invalid value type: " + t);
    }
    this.type = t;
  }
  evaluate() {
    return this.value;
  }
  toString() {
    switch (this.type) {
      case "number":
        return String(this.value);
      case "string":
        return '"' + this.value + '"';
      default:
        throw new Error("Invalid type");
    }
  }
}
class g extends u {
  constructor(e, t, i) {
    super();
    n(this, "operator");
    n(this, "left");
    n(this, "right");
    if (!["+", "-"].includes(e))
      throw new Error(`Operator not allowed in Plus/Minus expression: ${e}`);
    this.operator = e, this.left = t, this.right = i;
  }
  evaluate(e = {}) {
    const t = this.left.evaluate(e), i = this.right.evaluate(e);
    if (p.throwIfNotNumber(t), p.throwIfNotNumber(i), this.operator === "+")
      return Number(t) + Number(i);
    if (this.operator === "-")
      return Number(t) - Number(i);
    throw new Error("Unknown operator for PlusMinus expression");
  }
  toString() {
    return `${this.left.toString()} ${this.operator} ${this.right.toString()}`;
  }
}
class b extends u {
  constructor(e, t, i) {
    super();
    n(this, "operator");
    n(this, "left");
    n(this, "right");
    if (!["*", "/"].includes(e))
      throw new Error(`Operator not allowed in Multiply/Division expression: ${e}`);
    this.operator = e, this.left = t, this.right = i;
  }
  evaluate(e = {}) {
    const t = this.left.evaluate(e), i = this.right.evaluate(e);
    if (p.throwIfNotNumber(t), p.throwIfNotNumber(i), this.operator === "*")
      return Number(t) * Number(i);
    if (this.operator === "/")
      return Number(t) / Number(i);
    throw new Error("Unknown operator for MultDiv expression");
  }
  toString() {
    return `${this.left.toString()} ${this.operator} ${this.right.toString()}`;
  }
}
class x extends u {
  constructor(e, t) {
    super();
    n(this, "base");
    n(this, "exponent");
    this.base = e, this.exponent = t;
  }
  evaluate(e = {}) {
    const t = this.base.evaluate(e), i = this.exponent.evaluate(e);
    return p.throwIfNotNumber(t), p.throwIfNotNumber(i), Math.pow(Number(t), Number(i));
  }
  toString() {
    return `${this.base.toString()}^${this.exponent.toString()}`;
  }
}
class S extends u {
  constructor(e, t, i = null) {
    super();
    n(this, "fn");
    n(this, "varPath");
    n(this, "argumentExpressions");
    n(this, "formulaObject");
    n(this, "blacklisted");
    this.fn = e != null ? e : "", this.varPath = this.fn.split("."), this.argumentExpressions = t || [], this.formulaObject = i, this.blacklisted = void 0;
  }
  evaluate(e = {}) {
    var a;
    e = e || {};
    const t = this.argumentExpressions.map((s) => s.evaluate(e));
    try {
      let s = m(e, this.varPath, this.fn);
      if (s instanceof Function)
        return s.apply(this, t);
    } catch (s) {
    }
    let i;
    try {
      i = m((a = this.formulaObject) != null ? a : {}, this.varPath, this.fn);
    } catch (s) {
    }
    if (this.formulaObject && i instanceof Function) {
      if (this.isBlacklisted())
        throw new Error("Blacklisted function called: " + this.fn);
      return i.apply(this.formulaObject, t);
    }
    try {
      const s = m(Math, this.varPath, this.fn);
      if (s instanceof Function)
        return t.forEach((o) => {
          $.throwIfNotNumber(o);
        }), s.apply(this, t);
    } catch (s) {
    }
    throw new Error("Function not found: " + this.fn);
  }
  toString() {
    return `${this.fn}(${this.argumentExpressions.map((e) => e.toString()).join(", ")})`;
  }
  isBlacklisted() {
    return this.blacklisted === void 0 && (this.blacklisted = y.functionBlacklist.includes(
      this.formulaObject ? this.formulaObject[this.fn] : null
    )), this.blacklisted;
  }
}
function m(h, r, e) {
  let t = h;
  for (let i of r) {
    if (typeof t != "object")
      throw new Error(`Cannot evaluate ${i}, property not found (from path ${e})`);
    if (t[i] === void 0)
      throw new Error(`Cannot evaluate ${i}, property not found (from path ${e})`);
    t = t[i];
  }
  if (typeof t == "object")
    throw new Error("Invalid value");
  return t;
}
class d extends u {
  constructor(e, t = null) {
    super();
    n(this, "fullPath");
    n(this, "varPath");
    n(this, "formulaObject");
    this.formulaObject = t, this.fullPath = e, this.varPath = e.split(".");
  }
  evaluate(e = {}) {
    var i;
    let t;
    try {
      t = m(e, this.varPath, this.fullPath);
    } catch (a) {
    }
    if (t === void 0 && (t = m((i = this.formulaObject) != null ? i : {}, this.varPath, this.fullPath)), typeof t == "function" || typeof t == "object")
      throw new Error(`Cannot use ${this.fullPath} as value: It contains a non-numerical value.`);
    return t;
  }
  toString() {
    return `${this.varPath.join(".")}`;
  }
}
const l = class l {
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
  constructor(r, e = {}) {
    n(this, "formulaExpression");
    n(this, "options");
    n(this, "formulaStr");
    n(this, "_variables");
    n(this, "_memory");
    this.formulaExpression = null, this.options = { memoization: !1, ...e }, this.formulaStr = "", this._variables = [], this._memory = {}, this.setFormula(r);
  }
  /**
   * Re-sets the given String and parses it to a formula expression. Can be used after initialization,
   * to re-use the Formula object.
   *
   * @param {String} formulaString The formula string to set/parse
   * @return {this} The Formula object (this)
   */
  setFormula(r) {
    return r && (this.formulaExpression = null, this._variables = [], this._memory = {}, this.formulaStr = r, this.formulaExpression = this.parse(r)), this;
  }
  /**
   * Enable memoization: An expression is only evaluated once for the same input.
   * Further evaluations with the same input will return the in-memory stored result.
   */
  enableMemoization() {
    this.options.memoization = !0;
  }
  /**
   * Disable in-memory memoization: each call to evaluate() is executed from scratch.
   */
  disableMemoization() {
    this.options.memoization = !1, this._memory = {};
  }
  /**
   * Splits the given string by ',', makes sure the ',' is not within
   * a sub-expression
   * e.g.: str = "x,pow(3,4)" returns 2 elements: x and pow(3,4).
   */
  splitFunctionParams(r) {
    let e = 0, t = "";
    const i = [];
    for (let a of r.split(""))
      if (a === "," && e === 0)
        i.push(t), t = "";
      else if (a === "(")
        e++, t += a;
      else if (a === ")") {
        if (e--, t += a, e < 0)
          throw new Error("ERROR: Too many closing parentheses!");
      } else
        t += a;
    if (e !== 0)
      throw new Error("ERROR: Too many opening parentheses!");
    return t.length > 0 && i.push(t), i;
  }
  /**
   * Cleans the input string from unnecessary whitespace,
   * and replaces some known constants:
   */
  cleanupInputFormula(r) {
    const e = [];
    return r.split('"').forEach((i, a) => {
      a % 2 === 0 && (i = i.replace(/[\s]+/g, ""), Object.keys(E).forEach((s) => {
        i = i.replace(new RegExp(`\\b${s}\\b`, "g"), `[${s}]`);
      })), e.push(i);
    }), e.join('"');
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
   *   - numbers/[variables]/"strings"
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
  parse(r) {
    return r = this.cleanupInputFormula(r), this._do_parse(r);
  }
  /**
   * @see parse(): this is the recursive parse function, without the clean string part.
   * @param {String} str
   * @returns {Expression} An expression object, representing the expression tree
   */
  _do_parse(r) {
    let e = r.length - 1, t = 0, i = "initial", a = [], s = "", o = "", v = null, f = 0, c = "";
    for (; t <= e; ) {
      switch (i) {
        case "initial":
          if (s = r.charAt(t), s.match(/[0-9.]/))
            i = "within-nr", o = "", t--;
          else if (this.isOperator(s)) {
            if (s === "-" && (a.length === 0 || this.isOperatorExpr(a[a.length - 1]))) {
              i = "within-nr", o = "-";
              break;
            }
            if (t === e || this.isOperatorExpr(a[a.length - 1])) {
              i = "invalid";
              break;
            } else
              a.push(
                u.createOperatorExpression(s, new u(), new u())
              ), i = "initial";
          } else
            s === "(" ? (i = "within-parentheses", o = "", f = 0) : s === "[" ? (i = "within-named-var", o = "") : s.match(/["']/) ? (i = "within-string", c = s, o = "") : s.match(/[a-zA-Z]/) && (t < e && r.charAt(t + 1).match(/[a-zA-Z0-9_.]/) ? (o = s, i = "within-func") : (a.length > 0 && a[a.length - 1] instanceof w && a.push(
              u.createOperatorExpression("*", new u(), new u())
            ), a.push(new d(s, this)), this.registerVariable(s), i = "initial", o = ""));
          break;
        case "within-nr":
          s = r.charAt(t), s.match(/[0-9.]/) ? (o += s, t === e && (a.push(new w(o)), i = "initial")) : (o === "-" && (o = "-1"), a.push(new w(o)), o = "", i = "initial", t--);
          break;
        case "within-func":
          if (s = r.charAt(t), s.match(/[a-zA-Z0-9_.]/))
            o += s;
          else if (s === "(")
            v = o, o = "", f = 0, i = "within-func-parentheses";
          else
            throw new Error("Wrong character for function at position " + t);
          break;
        case "within-named-var":
          if (s = r.charAt(t), s === "]")
            a.push(new d(o, this)), this.registerVariable(o), o = "", i = "initial";
          else if (s.match(/[a-zA-Z0-9_.]/))
            o += s;
          else
            throw new Error("Character not allowed within named variable: " + s);
          break;
        case "within-string":
          s = r.charAt(t), s === c ? (a.push(new w(o, "string")), o = "", i = "initial", c = "") : o += s;
          break;
        case "within-parentheses":
        case "within-func-parentheses":
          if (s = r.charAt(t), c)
            s === c && (c = ""), o += s;
          else if (s === ")")
            if (f <= 0) {
              if (i === "within-parentheses")
                a.push(new N(this._do_parse(o)));
              else if (i === "within-func-parentheses") {
                let M = this.splitFunctionParams(o).map((k) => this._do_parse(k));
                a.push(new S(v, M, this)), v = null;
              }
              i = "initial";
            } else
              f--, o += s;
          else
            s === "(" ? (f++, o += s) : (s.match(/["']/) && (c = s), o += s);
          break;
      }
      t++;
    }
    if (i !== "initial")
      throw new Error("Could not parse formula: Syntax error.");
    return this.buildExpressionTree(a);
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
  buildExpressionTree(r) {
    if (r.length < 1)
      throw new Error("No expression given!");
    const e = [...r];
    let t = 0, i = null;
    for (; t < e.length; )
      if (i = e[t], i instanceof x) {
        if (t === 0 || t === e.length - 1)
          throw new Error("Wrong operator position!");
        i.base = e[t - 1], i.exponent = e[t + 1], e[t - 1] = i, e.splice(t, 2);
      } else
        t++;
    for (t = 0, i = null; t < e.length; )
      if (i = e[t], i instanceof b) {
        if (t === 0 || t === e.length - 1)
          throw new Error("Wrong operator position!");
        i.left = e[t - 1], i.right = e[t + 1], e[t - 1] = i, e.splice(t, 2);
      } else
        t++;
    for (t = 0, i = null; t < e.length; )
      if (i = e[t], i instanceof g) {
        if (t === 0 || t === e.length - 1)
          throw new Error("Wrong operator position!");
        i.left = e[t - 1], i.right = e[t + 1], e[t - 1] = i, e.splice(t, 2);
      } else
        t++;
    if (e.length !== 1)
      throw new Error("Could not parse formula: incorrect syntax?");
    return e[0];
  }
  isOperator(r) {
    return typeof r == "string" && r.match(/[+\-*/^]/);
  }
  isOperatorExpr(r) {
    return r instanceof g || r instanceof b || r instanceof x;
  }
  registerVariable(r) {
    this._variables.indexOf(r) < 0 && this._variables.push(r);
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
   * @return {Number|String|(Number|String)[]} The evaluated result, or an array with results
   */
  evaluate(r) {
    if (r instanceof Array)
      return r.map((t) => this.evaluate(t));
    let e = this.getExpression();
    if (!(e instanceof u))
      throw new Error("No expression set: Did you init the object with a Formula?");
    if (this.options.memoization) {
      let t = this.resultFromMemory(r);
      return t !== null || (t = e.evaluate({ ...E, ...r }), this.storeInMemory(r, t)), t;
    }
    return e.evaluate({ ...E, ...r });
  }
  hashValues(r) {
    return JSON.stringify(r);
  }
  resultFromMemory(r) {
    let e = this.hashValues(r), t = this._memory[e];
    return t !== void 0 ? t : null;
  }
  storeInMemory(r, e) {
    this._memory[this.hashValues(r)] = e;
  }
  getExpression() {
    return this.formulaExpression;
  }
  getExpressionString() {
    return this.formulaExpression ? this.formulaExpression.toString() : "";
  }
  static calc(r, e = null, t = {}) {
    return e = e != null ? e : {}, new l(r, t).evaluate(e);
  }
};
n(l, "Expression", u), n(l, "BracketExpression", N), n(l, "PowerExpression", x), n(l, "MultDivExpression", b), n(l, "PlusMinusExpression", g), n(l, "ValueExpression", w), n(l, "VariableExpression", d), n(l, "FunctionExpression", S), n(l, "MATH_CONSTANTS", E), // Create a function blacklist:
n(l, "functionBlacklist", Object.getOwnPropertyNames(l.prototype).filter((r) => l.prototype[r] instanceof Function).map((r) => l.prototype[r]));
let y = l;
export {
  y as default
};
//# sourceMappingURL=fparser.js.map
