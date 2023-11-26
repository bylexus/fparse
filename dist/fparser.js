var k = Object.defineProperty;
var P = (u, i, t) => i in u ? k(u, i, { enumerable: !0, configurable: !0, writable: !0, value: t }) : u[i] = t;
var n = (u, i, t) => (P(u, typeof i != "symbol" ? i + "" : i, t), t);
const f = {
  PI: Math.PI,
  E: Math.E,
  LN2: Math.LN2,
  LN10: Math.LN10,
  LOG2E: Math.LOG2E,
  LOG10E: Math.LOG10E,
  SQRT1_2: Math.SQRT1_2,
  SQRT2: Math.SQRT2
};
class l {
  static createOperatorExpression(i, t, e) {
    if (i === "^")
      return new x(t, e);
    if (i === "*" || i === "/")
      return new g(i, t, e);
    if (i === "+" || i === "-")
      return new E(i, t, e);
    throw new Error(`Unknown operator: ${i}`);
  }
  evaluate(i = {}) {
    throw new Error("Empty Expression - Must be defined in child classes");
  }
  toString() {
    return "";
  }
}
class b extends l {
  constructor(t) {
    super();
    n(this, "innerExpression");
    if (this.innerExpression = t, !(this.innerExpression instanceof l))
      throw new Error("No inner expression given for bracket expression");
  }
  evaluate(t = {}) {
    return this.innerExpression.evaluate(t);
  }
  toString() {
    return `(${this.innerExpression.toString()})`;
  }
}
class w extends l {
  constructor(t) {
    super();
    n(this, "value");
    if (this.value = Number(t), isNaN(this.value))
      throw new Error("Cannot parse number: " + t);
  }
  evaluate() {
    return this.value;
  }
  toString() {
    return String(this.value);
  }
}
class E extends l {
  constructor(t, e, r) {
    super();
    n(this, "operator");
    n(this, "left");
    n(this, "right");
    if (!["+", "-"].includes(t))
      throw new Error(`Operator not allowed in Plus/Minus expression: ${t}`);
    this.operator = t, this.left = e, this.right = r;
  }
  evaluate(t = {}) {
    if (this.operator === "+")
      return this.left.evaluate(t) + this.right.evaluate(t);
    if (this.operator === "-")
      return this.left.evaluate(t) - this.right.evaluate(t);
    throw new Error("Unknown operator for PlusMinus expression");
  }
  toString() {
    return `${this.left.toString()} ${this.operator} ${this.right.toString()}`;
  }
}
class g extends l {
  constructor(t, e, r) {
    super();
    n(this, "operator");
    n(this, "left");
    n(this, "right");
    if (!["*", "/"].includes(t))
      throw new Error(`Operator not allowed in Multiply/Division expression: ${t}`);
    this.operator = t, this.left = e, this.right = r;
  }
  evaluate(t = {}) {
    if (this.operator === "*")
      return this.left.evaluate(t) * this.right.evaluate(t);
    if (this.operator === "/")
      return this.left.evaluate(t) / this.right.evaluate(t);
    throw new Error("Unknown operator for MultDiv expression");
  }
  toString() {
    return `${this.left.toString()} ${this.operator} ${this.right.toString()}`;
  }
}
class x extends l {
  constructor(t, e) {
    super();
    n(this, "base");
    n(this, "exponent");
    this.base = t, this.exponent = e;
  }
  evaluate(t = {}) {
    return Math.pow(this.base.evaluate(t), this.exponent.evaluate(t));
  }
  toString() {
    return `${this.base.toString()}^${this.exponent.toString()}`;
  }
}
class y extends l {
  constructor(t, e, r = null) {
    super();
    n(this, "fn");
    n(this, "varPath");
    n(this, "argumentExpressions");
    n(this, "formulaObject");
    n(this, "blacklisted");
    this.fn = t != null ? t : "", this.varPath = this.fn.split("."), this.argumentExpressions = e || [], this.formulaObject = r, this.blacklisted = void 0;
  }
  evaluate(t = {}) {
    var o;
    t = t || {};
    const e = this.argumentExpressions.map((s) => s.evaluate(t));
    try {
      let s = c(t, this.varPath, this.fn);
      if (s instanceof Function)
        return s.apply(this, e);
    } catch (s) {
    }
    let r;
    try {
      r = c((o = this.formulaObject) != null ? o : {}, this.varPath, this.fn);
    } catch (s) {
    }
    if (this.formulaObject && r instanceof Function) {
      if (this.isBlacklisted())
        throw new Error("Blacklisted function called: " + this.fn);
      return r.apply(this.formulaObject, e);
    }
    try {
      const s = c(Math, this.varPath, this.fn);
      if (s instanceof Function)
        return s.apply(this, e);
    } catch (s) {
    }
    throw new Error("Function not found: " + this.fn);
  }
  toString() {
    return `${this.fn}(${this.argumentExpressions.map((t) => t.toString()).join(", ")})`;
  }
  isBlacklisted() {
    return this.blacklisted === void 0 && (this.blacklisted = d.functionBlacklist.includes(
      this.formulaObject ? this.formulaObject[this.fn] : null
    )), this.blacklisted;
  }
}
function c(u, i, t) {
  let e = u;
  for (let r of i) {
    if (typeof e != "object")
      throw new Error(`Cannot evaluate ${r}, property not found (from path ${t})`);
    if (e[r] === void 0)
      throw new Error(`Cannot evaluate ${r}, property not found (from path ${t})`);
    e = e[r];
  }
  if (typeof e == "object")
    throw new Error("Invalid value");
  return e;
}
class v extends l {
  constructor(t, e = null) {
    super();
    n(this, "fullPath");
    n(this, "varPath");
    n(this, "formulaObject");
    this.formulaObject = e, this.fullPath = t, this.varPath = t.split(".");
  }
  evaluate(t = {}) {
    var r;
    let e;
    try {
      e = c(t, this.varPath, this.fullPath);
    } catch (o) {
    }
    if (e === void 0 && (e = c((r = this.formulaObject) != null ? r : {}, this.varPath, this.fullPath)), typeof e == "function" || typeof e == "object")
      throw new Error(`Cannot use ${this.fullPath} as value: It contains a non-numerical value.`);
    return Number(e);
  }
  toString() {
    return `${this.varPath.join(".")}`;
  }
}
const h = class h {
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
  constructor(i, t = {}) {
    n(this, "formulaExpression");
    n(this, "options");
    n(this, "formulaStr");
    n(this, "_variables");
    n(this, "_memory");
    this.formulaExpression = null, this.options = { memoization: !1, ...t }, this.formulaStr = "", this._variables = [], this._memory = {}, this.setFormula(i);
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
    let t = 0, e = "";
    const r = [];
    for (let o of i.split(""))
      if (o === "," && t === 0)
        r.push(e), e = "";
      else if (o === "(")
        t++, e += o;
      else if (o === ")") {
        if (t--, e += o, t < 0)
          throw new Error("ERROR: Too many closing parentheses!");
      } else
        e += o;
    if (t !== 0)
      throw new Error("ERROR: Too many opening parentheses!");
    return e.length > 0 && r.push(e), r;
  }
  /**
   * Cleans the input string from unnecessary whitespace,
   * and replaces some known constants:
   */
  cleanupInputString(i) {
    return i = i.replace(/\s+/g, ""), Object.keys(f).forEach((t) => {
      i = i.replace(new RegExp(`\\b${t}\\b`, "g"), `[${t}]`);
    }), i;
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
  parse(i) {
    return i = this.cleanupInputString(i), this._do_parse(i);
  }
  /**
   * @see parse(): this is the recursive parse function, without the clean string part.
   * @param {String} str
   * @returns {Expression} An expression object, representing the expression tree
   */
  _do_parse(i) {
    let t = i.length - 1, e = 0, r = "initial", o = [], s = "", a = "", m = null, p = 0;
    for (; e <= t; ) {
      switch (r) {
        case "initial":
          if (s = i.charAt(e), s.match(/[0-9.]/))
            r = "within-nr", a = "", e--;
          else if (this.isOperator(s)) {
            if (s === "-" && (o.length === 0 || this.isOperatorExpr(o[o.length - 1]))) {
              r = "within-nr", a = "-";
              break;
            }
            if (e === t || this.isOperatorExpr(o[o.length - 1])) {
              r = "invalid";
              break;
            } else
              o.push(
                l.createOperatorExpression(s, new l(), new l())
              ), r = "initial";
          } else
            s === "(" ? (r = "within-parentheses", a = "", p = 0) : s === "[" ? (r = "within-named-var", a = "") : s.match(/[a-zA-Z]/) && (e < t && i.charAt(e + 1).match(/[a-zA-Z0-9_.]/) ? (a = s, r = "within-func") : (o.length > 0 && o[o.length - 1] instanceof w && o.push(
              l.createOperatorExpression("*", new l(), new l())
            ), o.push(new v(s, this)), this.registerVariable(s), r = "initial", a = ""));
          break;
        case "within-nr":
          s = i.charAt(e), s.match(/[0-9.]/) ? (a += s, e === t && (o.push(new w(a)), r = "initial")) : (a === "-" && (a = "-1"), o.push(new w(a)), a = "", r = "initial", e--);
          break;
        case "within-func":
          if (s = i.charAt(e), s.match(/[a-zA-Z0-9_.]/))
            a += s;
          else if (s === "(")
            m = a, a = "", p = 0, r = "within-func-parentheses";
          else
            throw new Error("Wrong character for function at position " + e);
          break;
        case "within-named-var":
          if (s = i.charAt(e), s === "]")
            o.push(new v(a, this)), this.registerVariable(a), a = "", r = "initial";
          else if (s.match(/[a-zA-Z0-9_.]/))
            a += s;
          else
            throw new Error("Character not allowed within named variable: " + s);
          break;
        case "within-parentheses":
        case "within-func-parentheses":
          if (s = i.charAt(e), s === ")")
            if (p <= 0) {
              if (r === "within-parentheses")
                o.push(new b(this._do_parse(a)));
              else if (r === "within-func-parentheses") {
                let S = this.splitFunctionParams(a).map((M) => this._do_parse(M));
                o.push(new y(m, S, this)), m = null;
              }
              r = "initial";
            } else
              p--, a += s;
          else
            s === "(" && p++, a += s;
          break;
      }
      e++;
    }
    if (r !== "initial")
      throw new Error("Could not parse formula: Syntax error.");
    return this.buildExpressionTree(o);
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
    const t = [...i];
    let e = 0, r = null;
    for (; e < t.length; )
      if (r = t[e], r instanceof x) {
        if (e === 0 || e === t.length - 1)
          throw new Error("Wrong operator position!");
        r.base = t[e - 1], r.exponent = t[e + 1], t[e - 1] = r, t.splice(e, 2);
      } else
        e++;
    for (e = 0, r = null; e < t.length; )
      if (r = t[e], r instanceof g) {
        if (e === 0 || e === t.length - 1)
          throw new Error("Wrong operator position!");
        r.left = t[e - 1], r.right = t[e + 1], t[e - 1] = r, t.splice(e, 2);
      } else
        e++;
    for (e = 0, r = null; e < t.length; )
      if (r = t[e], r instanceof E) {
        if (e === 0 || e === t.length - 1)
          throw new Error("Wrong operator position!");
        r.left = t[e - 1], r.right = t[e + 1], t[e - 1] = r, t.splice(e, 2);
      } else
        e++;
    if (t.length !== 1)
      throw new Error("Could not parse formula: incorrect syntax?");
    return t[0];
  }
  isOperator(i) {
    return typeof i == "string" && i.match(/[+\-*/^]/);
  }
  isOperatorExpr(i) {
    return i instanceof E || i instanceof g || i instanceof x;
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
   * @return {Number|Array<Number>} The evaluated result, or an array with results
   */
  evaluate(i) {
    if (i instanceof Array)
      return i.map((e) => this.evaluate(e));
    let t = this.getExpression();
    if (!(t instanceof l))
      throw new Error("No expression set: Did you init the object with a Formula?");
    if (this.options.memoization) {
      let e = this.resultFromMemory(i);
      return e !== null || (e = t.evaluate({ ...f, ...i }), this.storeInMemory(i, e)), e;
    }
    return t.evaluate({ ...f, ...i });
  }
  hashValues(i) {
    return JSON.stringify(i);
  }
  resultFromMemory(i) {
    let t = this.hashValues(i), e = this._memory[t];
    return e !== void 0 ? e : null;
  }
  storeInMemory(i, t) {
    this._memory[this.hashValues(i)] = t;
  }
  getExpression() {
    return this.formulaExpression;
  }
  getExpressionString() {
    return this.formulaExpression ? this.formulaExpression.toString() : "";
  }
  static calc(i, t = null, e = {}) {
    return t = t != null ? t : {}, new h(i, e).evaluate(t);
  }
};
n(h, "Expression", l), n(h, "BracketExpression", b), n(h, "PowerExpression", x), n(h, "MultDivExpression", g), n(h, "PlusMinusExpression", E), n(h, "ValueExpression", w), n(h, "VariableExpression", v), n(h, "FunctionExpression", y), n(h, "MATH_CONSTANTS", f), // Create a function blacklist:
n(h, "functionBlacklist", Object.getOwnPropertyNames(h.prototype).filter((i) => h.prototype[i] instanceof Function).map((i) => h.prototype[i]));
let d = h;
export {
  d as default
};
//# sourceMappingURL=fparser.js.map
