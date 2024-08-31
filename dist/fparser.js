var M = Object.defineProperty;
var T = (h, r, e) => r in h ? M(h, r, { enumerable: !0, configurable: !0, writable: !0, value: e }) : h[r] = e;
var n = (h, r, e) => (T(h, typeof r != "symbol" ? r + "" : r, e), e);
const x = {
  PI: Math.PI,
  E: Math.E,
  LN2: Math.LN2,
  LN10: Math.LN10,
  LOG2E: Math.LOG2E,
  LOG10E: Math.LOG10E,
  SQRT1_2: Math.SQRT1_2,
  SQRT2: Math.SQRT2
};
class g {
  static throwIfNotNumber(r) {
    if (typeof r === "string")
      throw new Error("Strings are not allowed in math operations");
  }
}
class A {
  static throwIfNotNumber(r) {
    if (typeof r === "string")
      throw new Error("Strings are not allowed in math operations");
  }
}
class u {
  static createOperatorExpression(r, e, t) {
    if (r === "^")
      return new v(e, t);
    if (["*", "/"].includes(r))
      return new m(r, e, t);
    if (["+", "-"].includes(r))
      return new w(r, e, t);
    if (["<", ">", "<=", ">=", "=", "!="].includes(r))
      return new c(r, e, t);
    throw new Error(`Unknown operator: ${r}`);
  }
  toString() {
    return "";
  }
}
class p extends u {
  evaluate(r) {
    throw new Error("PlaceholderExpression cannot be evaluated");
  }
  toString() {
    return "[placeholder]";
  }
}
class k extends u {
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
class b extends u {
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
class w extends u {
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
    if (g.throwIfNotNumber(t), g.throwIfNotNumber(i), this.operator === "+")
      return Number(t) + Number(i);
    if (this.operator === "-")
      return Number(t) - Number(i);
    throw new Error("Unknown operator for PlusMinus expression");
  }
  toString() {
    return `${this.left.toString()} ${this.operator} ${this.right.toString()}`;
  }
}
n(w, "PLUS", "+"), n(w, "MINUS", "-");
class m extends u {
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
    if (g.throwIfNotNumber(t), g.throwIfNotNumber(i), this.operator === "*")
      return Number(t) * Number(i);
    if (this.operator === "/")
      return Number(t) / Number(i);
    throw new Error("Unknown operator for MultDiv expression");
  }
  toString() {
    return `${this.left.toString()} ${this.operator} ${this.right.toString()}`;
  }
}
n(m, "MULT", "*"), n(m, "DIV", "/");
class v extends u {
  constructor(e, t) {
    super();
    n(this, "base");
    n(this, "exponent");
    this.base = e, this.exponent = t;
  }
  evaluate(e = {}) {
    const t = this.base.evaluate(e), i = this.exponent.evaluate(e);
    return g.throwIfNotNumber(t), g.throwIfNotNumber(i), Math.pow(Number(t), Number(i));
  }
  toString() {
    return `${this.base.toString()}^${this.exponent.toString()}`;
  }
}
class c extends u {
  constructor(e, t, i) {
    super();
    n(this, "operator");
    n(this, "left");
    n(this, "right");
    if (!["<", ">", "<=", ">=", "=", "!="].includes(e))
      throw new Error(`Operator not allowed in Logical expression: ${e}`);
    this.operator = e, this.left = t, this.right = i;
  }
  evaluate(e = {}) {
    const t = this.left.evaluate(e), i = this.right.evaluate(e);
    switch (this.operator) {
      case "<":
        return t < i ? 1 : 0;
      case ">":
        return t > i ? 1 : 0;
      case "<=":
        return t <= i ? 1 : 0;
      case ">=":
        return t >= i ? 1 : 0;
      case "=":
        return t === i ? 1 : 0;
      case "!=":
        return t !== i ? 1 : 0;
    }
    throw new Error("Unknown operator for Logical expression");
  }
  toString() {
    return `${this.left.toString()} ${this.operator} ${this.right.toString()}`;
  }
}
n(c, "LT", "<"), n(c, "GT", ">"), n(c, "LTE", "<="), n(c, "GTE", ">="), n(c, "EQ", "="), n(c, "NEQ", "!=");
class O extends u {
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
    var o;
    e = e || {};
    const t = this.argumentExpressions.map((s) => s.evaluate(e));
    try {
      let s = d(e, this.varPath, this.fn);
      if (s instanceof Function)
        return s.apply(this, t);
    } catch (s) {
    }
    let i;
    try {
      i = d((o = this.formulaObject) != null ? o : {}, this.varPath, this.fn);
    } catch (s) {
    }
    if (this.formulaObject && i instanceof Function) {
      if (this.isBlacklisted())
        throw new Error("Blacklisted function called: " + this.fn);
      return i.apply(this.formulaObject, t);
    }
    try {
      const s = d(Math, this.varPath, this.fn);
      if (s instanceof Function)
        return t.forEach((a) => {
          A.throwIfNotNumber(a);
        }), s.apply(this, t);
    } catch (s) {
    }
    throw new Error("Function not found: " + this.fn);
  }
  toString() {
    return `${this.fn}(${this.argumentExpressions.map((e) => e.toString()).join(", ")})`;
  }
  isBlacklisted() {
    return this.blacklisted === void 0 && (this.blacklisted = S.functionBlacklist.includes(
      this.formulaObject ? this.formulaObject[this.fn] : null
    )), this.blacklisted;
  }
}
function d(h, r, e) {
  let t = h, i = null;
  for (let o of r) {
    if (!["object", "string"].includes(typeof t))
      throw new Error(`Cannot evaluate ${o}, property not found (from path ${e})`);
    if (typeof t == "object" && !(o in t))
      throw new Error(`Cannot evaluate ${o}, property not found (from path ${e})`);
    if (typeof t == "string" && !t.hasOwnProperty(o))
      throw new Error(`Cannot evaluate ${o}, property not found (from path ${e})`);
    i = t, t = t[o];
  }
  if (typeof t == "object" && !(t instanceof Array))
    throw new Error("Invalid value");
  return typeof t == "function" && i && (t = t.bind(i)), t;
}
class N extends u {
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
      t = d(e, this.varPath, this.fullPath);
    } catch (o) {
    }
    if (t === void 0 && (t = d((i = this.formulaObject) != null ? i : {}, this.varPath, this.fullPath)), typeof t == "function" || typeof t == "object")
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
    for (let o of r.split(""))
      if (o === "," && e === 0)
        i.push(t), t = "";
      else if (o === "(")
        e++, t += o;
      else if (o === ")") {
        if (e--, t += o, e < 0)
          throw new Error("ERROR: Too many closing parentheses!");
      } else
        t += o;
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
    return r.split('"').forEach((i, o) => {
      o % 2 === 0 && (i = i.replace(/[\s]+/g, ""), Object.keys(x).forEach((s) => {
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
    let e = r.length - 1, t = 0, i = "initial", o = [], s = "", a = "", y = null, E = 0, f = "";
    for (; t <= e; ) {
      switch (i) {
        case "initial":
          if (s = r.charAt(t), s.match(/[0-9.]/))
            i = "within-nr", a = "", t--;
          else if (this.isOperator(s)) {
            if (s === "-" && (o.length === 0 || this.isOperatorExpr(o[o.length - 1]))) {
              i = "within-nr", a = "-";
              break;
            }
            if (t === e || this.isOperatorExpr(o[o.length - 1])) {
              i = "invalid";
              break;
            } else
              o.push(
                u.createOperatorExpression(
                  s,
                  new p(),
                  new p()
                )
              ), i = "initial";
          } else if ([">", "<", "=", "!"].includes(s))
            if (t === e) {
              i = "invalid";
              break;
            } else
              i = "within-logical-operator", a = s;
          else
            s === "(" ? (i = "within-parentheses", a = "", E = 0) : s === "[" ? (i = "within-named-var", a = "") : s.match(/["']/) ? (i = "within-string", f = s, a = "") : s.match(/[a-zA-Z]/) && (t < e && r.charAt(t + 1).match(/[a-zA-Z0-9_.]/) ? (a = s, i = "within-func") : (o.length > 0 && o[o.length - 1] instanceof b && o.push(
              u.createOperatorExpression(
                "*",
                new p(),
                new p()
              )
            ), o.push(new N(s, this)), this.registerVariable(s), i = "initial", a = ""));
          break;
        case "within-nr":
          s = r.charAt(t), s.match(/[0-9.]/) ? (a += s, t === e && (o.push(new b(a)), i = "initial")) : (a === "-" && (a = "-1"), o.push(new b(a)), a = "", i = "initial", t--);
          break;
        case "within-func":
          if (s = r.charAt(t), s.match(/[a-zA-Z0-9_.]/))
            a += s;
          else if (s === "(")
            y = a, a = "", E = 0, i = "within-func-parentheses";
          else
            throw new Error("Wrong character for function at position " + t);
          break;
        case "within-named-var":
          if (s = r.charAt(t), s === "]")
            o.push(new N(a, this)), this.registerVariable(a), a = "", i = "initial";
          else if (s.match(/[a-zA-Z0-9_.]/))
            a += s;
          else
            throw new Error("Character not allowed within named variable: " + s);
          break;
        case "within-string":
          s = r.charAt(t), s === f ? (o.push(new b(a, "string")), a = "", i = "initial", f = "") : a += s;
          break;
        case "within-parentheses":
        case "within-func-parentheses":
          if (s = r.charAt(t), f)
            s === f && (f = ""), a += s;
          else if (s === ")")
            if (E <= 0) {
              if (i === "within-parentheses")
                o.push(new k(this._do_parse(a)));
              else if (i === "within-func-parentheses") {
                let P = this.splitFunctionParams(a).map(($) => this._do_parse($));
                o.push(new O(y, P, this)), y = null;
              }
              i = "initial";
            } else
              E--, a += s;
          else
            s === "(" ? (E++, a += s) : (s.match(/["']/) && (f = s), a += s);
          break;
        case "within-logical-operator":
          s = r.charAt(t), s === "=" && (a += s, t++), o.push(
            u.createOperatorExpression(
              a,
              new p(),
              new p()
            )
          ), a = "", i = "initial", t--;
          break;
      }
      t++;
    }
    if (i !== "initial")
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
  buildExpressionTree(r) {
    if (r.length < 1)
      throw new Error("No expression given!");
    const e = [...r];
    let t = 0, i = null;
    for (; t < e.length; )
      if (i = e[t], i instanceof v) {
        if (t === 0 || t === e.length - 1)
          throw new Error("Wrong operator position!");
        i.base = e[t - 1], i.exponent = e[t + 1], e[t - 1] = i, e.splice(t, 2);
      } else
        t++;
    for (t = 0, i = null; t < e.length; )
      if (i = e[t], i instanceof m) {
        if (t === 0 || t === e.length - 1)
          throw new Error("Wrong operator position!");
        i.left = e[t - 1], i.right = e[t + 1], e[t - 1] = i, e.splice(t, 2);
      } else
        t++;
    for (t = 0, i = null; t < e.length; )
      if (i = e[t], i instanceof w) {
        if (t === 0 || t === e.length - 1)
          throw new Error("Wrong operator position!");
        i.left = e[t - 1], i.right = e[t + 1], e[t - 1] = i, e.splice(t, 2);
      } else
        t++;
    for (t = 0, i = null; t < e.length; )
      if (i = e[t], i instanceof c) {
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
    return r instanceof w || r instanceof m || r instanceof v || r instanceof c;
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
      return t !== null || (t = e.evaluate({ ...x, ...r }), this.storeInMemory(r, t)), t;
    }
    return e.evaluate({ ...x, ...r });
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
  /**
   * Implements an if/else condition as a function: Checks the predicate
   * if it evaluates to true-ish (> 0, true, non-empty string, etc.). Returns the trueValue if
   * the predicate evaluates to true, else the falseValue.
   * allowed formula functio
   * @param predicate
   * @param trueValue
   * @param falseValue
   * @returns
   */
  ifElse(r, e, t) {
    return r ? e : t;
  }
  first(...r) {
    for (const e of r)
      if (e instanceof Array) {
        let t = this.first(...e);
        if (t)
          return t;
      } else if (e)
        return e;
    if (r.length > 0) {
      const e = r[r.length - 1];
      return e instanceof Array ? this.first(...e) : e;
    }
    throw new Error("first(): At least one argument is required");
  }
};
n(l, "Expression", u), n(l, "BracketExpression", k), n(l, "PowerExpression", v), n(l, "MultDivExpression", m), n(l, "PlusMinusExpression", w), n(l, "LogicalExpression", c), n(l, "ValueExpression", b), n(l, "VariableExpression", N), n(l, "FunctionExpression", O), n(l, "MATH_CONSTANTS", x), n(l, "ALLOWED_FUNCTIONS", ["ifElse", "first"]), // Create a function blacklist:
n(l, "functionBlacklist", Object.getOwnPropertyNames(l.prototype).filter((r) => l.prototype[r] instanceof Function && !l.ALLOWED_FUNCTIONS.includes(r)).map((r) => l.prototype[r]));
let S = l;
export {
  S as default
};
//# sourceMappingURL=fparser.js.map
