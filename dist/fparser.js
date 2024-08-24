var $ = Object.defineProperty;
var O = (l, i, e) => i in l ? $(l, i, { enumerable: !0, configurable: !0, writable: !0, value: e }) : l[i] = e;
var n = (l, i, e) => O(l, typeof i != "symbol" ? i + "" : i, e);
const g = {
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
  static throwIfNotNumber(i) {
    if (typeof i === "string")
      throw new Error("Strings are not allowed in math operations");
  }
}
class V {
  static throwIfNotNumber(i) {
    if (typeof i === "string")
      throw new Error("Strings are not allowed in math operations");
  }
}
class h {
  static createOperatorExpression(i, e, t) {
    if (i === "^")
      return new b(e, t);
    if (["*", "/"].includes(i))
      return new x(i, e, t);
    if (["+", "-"].includes(i))
      return new E(i, e, t);
    if (["<", ">", "<=", ">=", "=", "!="].includes(i))
      return new d(i, e, t);
    throw new Error(`Unknown operator: ${i}`);
  }
  evaluate(i = {}) {
    throw new Error("Empty Expression - Must be defined in child classes");
  }
  toString() {
    return "";
  }
}
class S extends h {
  constructor(e) {
    super();
    n(this, "innerExpression");
    if (this.innerExpression = e, !(this.innerExpression instanceof h))
      throw new Error("No inner expression given for bracket expression");
  }
  evaluate(e = {}) {
    return this.innerExpression.evaluate(e);
  }
  toString() {
    return `(${this.innerExpression.toString()})`;
  }
}
class w extends h {
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
class E extends h {
  constructor(e, t, r) {
    super();
    n(this, "operator");
    n(this, "left");
    n(this, "right");
    if (!["+", "-"].includes(e))
      throw new Error(`Operator not allowed in Plus/Minus expression: ${e}`);
    this.operator = e, this.left = t, this.right = r;
  }
  evaluate(e = {}) {
    const t = this.left.evaluate(e), r = this.right.evaluate(e);
    if (p.throwIfNotNumber(t), p.throwIfNotNumber(r), this.operator === "+")
      return Number(t) + Number(r);
    if (this.operator === "-")
      return Number(t) - Number(r);
    throw new Error("Unknown operator for PlusMinus expression");
  }
  toString() {
    return `${this.left.toString()} ${this.operator} ${this.right.toString()}`;
  }
}
class x extends h {
  constructor(e, t, r) {
    super();
    n(this, "operator");
    n(this, "left");
    n(this, "right");
    if (!["*", "/"].includes(e))
      throw new Error(`Operator not allowed in Multiply/Division expression: ${e}`);
    this.operator = e, this.left = t, this.right = r;
  }
  evaluate(e = {}) {
    const t = this.left.evaluate(e), r = this.right.evaluate(e);
    if (p.throwIfNotNumber(t), p.throwIfNotNumber(r), this.operator === "*")
      return Number(t) * Number(r);
    if (this.operator === "/")
      return Number(t) / Number(r);
    throw new Error("Unknown operator for MultDiv expression");
  }
  toString() {
    return `${this.left.toString()} ${this.operator} ${this.right.toString()}`;
  }
}
class b extends h {
  constructor(e, t) {
    super();
    n(this, "base");
    n(this, "exponent");
    this.base = e, this.exponent = t;
  }
  evaluate(e = {}) {
    const t = this.base.evaluate(e), r = this.exponent.evaluate(e);
    return p.throwIfNotNumber(t), p.throwIfNotNumber(r), Math.pow(Number(t), Number(r));
  }
  toString() {
    return `${this.base.toString()}^${this.exponent.toString()}`;
  }
}
class d extends h {
  constructor(e, t, r) {
    super();
    n(this, "operator");
    n(this, "left");
    n(this, "right");
    if (!["<", ">", "<=", ">=", "=", "!="].includes(e))
      throw new Error(`Operator not allowed in Logical expression: ${e}`);
    this.operator = e, this.left = t, this.right = r;
  }
  evaluate(e = {}) {
    const t = this.left.evaluate(e), r = this.right.evaluate(e);
    switch (this.operator) {
      case "<":
        return t < r ? 1 : 0;
      case ">":
        return t > r ? 1 : 0;
      case "<=":
        return t <= r ? 1 : 0;
      case ">=":
        return t >= r ? 1 : 0;
      case "=":
        return t === r ? 1 : 0;
      case "!=":
        return t !== r ? 1 : 0;
    }
    throw new Error("Unknown operator for Logical expression");
  }
  toString() {
    return `${this.left.toString()} ${this.operator} ${this.right.toString()}`;
  }
}
class k extends h {
  constructor(e, t, r = null) {
    super();
    n(this, "fn");
    n(this, "varPath");
    n(this, "argumentExpressions");
    n(this, "formulaObject");
    n(this, "blacklisted");
    this.fn = e != null ? e : "", this.varPath = this.fn.split("."), this.argumentExpressions = t || [], this.formulaObject = r, this.blacklisted = void 0;
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
    let r;
    try {
      r = m((a = this.formulaObject) != null ? a : {}, this.varPath, this.fn);
    } catch (s) {
    }
    if (this.formulaObject && r instanceof Function) {
      if (this.isBlacklisted())
        throw new Error("Blacklisted function called: " + this.fn);
      return r.apply(this.formulaObject, t);
    }
    try {
      const s = m(Math, this.varPath, this.fn);
      if (s instanceof Function)
        return t.forEach((o) => {
          V.throwIfNotNumber(o);
        }), s.apply(this, t);
    } catch (s) {
    }
    throw new Error("Function not found: " + this.fn);
  }
  toString() {
    return `${this.fn}(${this.argumentExpressions.map((e) => e.toString()).join(", ")})`;
  }
  isBlacklisted() {
    return this.blacklisted === void 0 && (this.blacklisted = N.functionBlacklist.includes(
      this.formulaObject ? this.formulaObject[this.fn] : null
    )), this.blacklisted;
  }
}
function m(l, i, e) {
  let t = l;
  for (let r of i) {
    if (typeof t != "object")
      throw new Error(`Cannot evaluate ${r}, property not found (from path ${e})`);
    if (t[r] === void 0)
      throw new Error(`Cannot evaluate ${r}, property not found (from path ${e})`);
    t = t[r];
  }
  if (typeof t == "object")
    throw new Error("Invalid value");
  return t;
}
class y extends h {
  constructor(e, t = null) {
    super();
    n(this, "fullPath");
    n(this, "varPath");
    n(this, "formulaObject");
    this.formulaObject = t, this.fullPath = e, this.varPath = e.split(".");
  }
  evaluate(e = {}) {
    var r;
    let t;
    try {
      t = m(e, this.varPath, this.fullPath);
    } catch (a) {
    }
    if (t === void 0 && (t = m((r = this.formulaObject) != null ? r : {}, this.varPath, this.fullPath)), typeof t == "function" || typeof t == "object")
      throw new Error(`Cannot use ${this.fullPath} as value: It contains a non-numerical value.`);
    return t;
  }
  toString() {
    return `${this.varPath.join(".")}`;
  }
}
const u = class u {
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
  constructor(i, e = {}) {
    n(this, "formulaExpression");
    n(this, "options");
    n(this, "formulaStr");
    n(this, "_variables");
    n(this, "_memory");
    this.formulaExpression = null, this.options = { memoization: !1, ...e }, this.formulaStr = "", this._variables = [], this._memory = {}, this.setFormula(i);
  }
  /**
   * Re-sets the given String and parses it to a formula expression. Can be used after initialization,
   * to re-use the Formula object.
   *
   * @param {String} formulaString The formula string to set/parse
   * @return {this} The Formula object (this)
   */
  setFormula(i) {
    return i && (this.formulaExpression = null, this._variables = [], this._memory = {}, this.formulaStr = i, this.formulaExpression = this.parse(i)), this;
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
  splitFunctionParams(i) {
    let e = 0, t = "";
    const r = [];
    for (let a of i.split(""))
      if (a === "," && e === 0)
        r.push(t), t = "";
      else if (a === "(")
        e++, t += a;
      else if (a === ")") {
        if (e--, t += a, e < 0)
          throw new Error("ERROR: Too many closing parentheses!");
      } else
        t += a;
    if (e !== 0)
      throw new Error("ERROR: Too many opening parentheses!");
    return t.length > 0 && r.push(t), r;
  }
  /**
   * Cleans the input string from unnecessary whitespace,
   * and replaces some known constants:
   */
  cleanupInputFormula(i) {
    const e = [];
    return i.split('"').forEach((r, a) => {
      a % 2 === 0 && (r = r.replace(/[\s]+/g, ""), Object.keys(g).forEach((s) => {
        r = r.replace(new RegExp(`\\b${s}\\b`, "g"), `[${s}]`);
      })), e.push(r);
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
  parse(i) {
    return i = this.cleanupInputFormula(i), this._do_parse(i);
  }
  /**
   * @see parse(): this is the recursive parse function, without the clean string part.
   * @param {String} str
   * @returns {Expression} An expression object, representing the expression tree
   */
  _do_parse(i) {
    let e = i.length - 1, t = 0, r = "initial", a = [], s = "", o = "", v = null, f = 0, c = "";
    for (; t <= e; ) {
      switch (r) {
        case "initial":
          if (s = i.charAt(t), s.match(/[0-9.]/))
            r = "within-nr", o = "", t--;
          else if (this.isOperator(s)) {
            if (s === "-" && (a.length === 0 || this.isOperatorExpr(a[a.length - 1]))) {
              r = "within-nr", o = "-";
              break;
            }
            if (t === e || this.isOperatorExpr(a[a.length - 1])) {
              r = "invalid";
              break;
            } else
              a.push(
                h.createOperatorExpression(s, new h(), new h())
              ), r = "initial";
          } else if ([">", "<", "=", "!"].includes(s))
            if (t === e) {
              r = "invalid";
              break;
            } else
              r = "within-logical-operator", o = s;
          else s === "(" ? (r = "within-parentheses", o = "", f = 0) : s === "[" ? (r = "within-named-var", o = "") : s.match(/["']/) ? (r = "within-string", c = s, o = "") : s.match(/[a-zA-Z]/) && (t < e && i.charAt(t + 1).match(/[a-zA-Z0-9_.]/) ? (o = s, r = "within-func") : (a.length > 0 && a[a.length - 1] instanceof w && a.push(
            h.createOperatorExpression("*", new h(), new h())
          ), a.push(new y(s, this)), this.registerVariable(s), r = "initial", o = ""));
          break;
        case "within-nr":
          s = i.charAt(t), s.match(/[0-9.]/) ? (o += s, t === e && (a.push(new w(o)), r = "initial")) : (o === "-" && (o = "-1"), a.push(new w(o)), o = "", r = "initial", t--);
          break;
        case "within-func":
          if (s = i.charAt(t), s.match(/[a-zA-Z0-9_.]/))
            o += s;
          else if (s === "(")
            v = o, o = "", f = 0, r = "within-func-parentheses";
          else
            throw new Error("Wrong character for function at position " + t);
          break;
        case "within-named-var":
          if (s = i.charAt(t), s === "]")
            a.push(new y(o, this)), this.registerVariable(o), o = "", r = "initial";
          else if (s.match(/[a-zA-Z0-9_.]/))
            o += s;
          else
            throw new Error("Character not allowed within named variable: " + s);
          break;
        case "within-string":
          s = i.charAt(t), s === c ? (a.push(new w(o, "string")), o = "", r = "initial", c = "") : o += s;
          break;
        case "within-parentheses":
        case "within-func-parentheses":
          if (s = i.charAt(t), c)
            s === c && (c = ""), o += s;
          else if (s === ")")
            if (f <= 0) {
              if (r === "within-parentheses")
                a.push(new S(this._do_parse(o)));
              else if (r === "within-func-parentheses") {
                let M = this.splitFunctionParams(o).map((P) => this._do_parse(P));
                a.push(new k(v, M, this)), v = null;
              }
              r = "initial";
            } else
              f--, o += s;
          else s === "(" ? (f++, o += s) : (s.match(/["']/) && (c = s), o += s);
          break;
        case "within-logical-operator":
          s = i.charAt(t), s === "=" && (o += s, t++), a.push(h.createOperatorExpression(o, new h(), new h())), o = "", r = "initial", t--;
          break;
      }
      t++;
    }
    if (r !== "initial")
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
  buildExpressionTree(i) {
    if (i.length < 1)
      throw new Error("No expression given!");
    const e = [...i];
    let t = 0, r = null;
    for (; t < e.length; )
      if (r = e[t], r instanceof b) {
        if (t === 0 || t === e.length - 1)
          throw new Error("Wrong operator position!");
        r.base = e[t - 1], r.exponent = e[t + 1], e[t - 1] = r, e.splice(t, 2);
      } else
        t++;
    for (t = 0, r = null; t < e.length; )
      if (r = e[t], r instanceof x) {
        if (t === 0 || t === e.length - 1)
          throw new Error("Wrong operator position!");
        r.left = e[t - 1], r.right = e[t + 1], e[t - 1] = r, e.splice(t, 2);
      } else
        t++;
    for (t = 0, r = null; t < e.length; )
      if (r = e[t], r instanceof E) {
        if (t === 0 || t === e.length - 1)
          throw new Error("Wrong operator position!");
        r.left = e[t - 1], r.right = e[t + 1], e[t - 1] = r, e.splice(t, 2);
      } else
        t++;
    for (t = 0, r = null; t < e.length; )
      if (r = e[t], r instanceof d) {
        if (t === 0 || t === e.length - 1)
          throw new Error("Wrong operator position!");
        r.left = e[t - 1], r.right = e[t + 1], e[t - 1] = r, e.splice(t, 2);
      } else
        t++;
    if (e.length !== 1)
      throw new Error("Could not parse formula: incorrect syntax?");
    return e[0];
  }
  isOperator(i) {
    return typeof i == "string" && i.match(/[+\-*/^]/);
  }
  isOperatorExpr(i) {
    return i instanceof E || i instanceof x || i instanceof b || i instanceof d;
  }
  registerVariable(i) {
    this._variables.indexOf(i) < 0 && this._variables.push(i);
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
  evaluate(i) {
    if (i instanceof Array)
      return i.map((t) => this.evaluate(t));
    let e = this.getExpression();
    if (!(e instanceof h))
      throw new Error("No expression set: Did you init the object with a Formula?");
    if (this.options.memoization) {
      let t = this.resultFromMemory(i);
      return t !== null || (t = e.evaluate({ ...g, ...i }), this.storeInMemory(i, t)), t;
    }
    return e.evaluate({ ...g, ...i });
  }
  hashValues(i) {
    return JSON.stringify(i);
  }
  resultFromMemory(i) {
    let e = this.hashValues(i), t = this._memory[e];
    return t !== void 0 ? t : null;
  }
  storeInMemory(i, e) {
    this._memory[this.hashValues(i)] = e;
  }
  getExpression() {
    return this.formulaExpression;
  }
  getExpressionString() {
    return this.formulaExpression ? this.formulaExpression.toString() : "";
  }
  static calc(i, e = null, t = {}) {
    return e = e != null ? e : {}, new u(i, t).evaluate(e);
  }
};
n(u, "Expression", h), n(u, "BracketExpression", S), n(u, "PowerExpression", b), n(u, "MultDivExpression", x), n(u, "PlusMinusExpression", E), n(u, "LogicalExpression", d), n(u, "ValueExpression", w), n(u, "VariableExpression", y), n(u, "FunctionExpression", k), n(u, "MATH_CONSTANTS", g), // Create a function blacklist:
n(u, "functionBlacklist", Object.getOwnPropertyNames(u.prototype).filter((i) => u.prototype[i] instanceof Function).map((i) => u.prototype[i]));
let N = u;
export {
  N as default
};
//# sourceMappingURL=fparser.js.map
