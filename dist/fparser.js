var P = Object.defineProperty;
var O = (h, r, t) => r in h ? P(h, r, { enumerable: !0, configurable: !0, writable: !0, value: t }) : h[r] = t;
var n = (h, r, t) => (O(h, typeof r != "symbol" ? r + "" : r, t), t);
const m = {
  PI: Math.PI,
  E: Math.E,
  LN2: Math.LN2,
  LN10: Math.LN10,
  LOG2E: Math.LOG2E,
  LOG10E: Math.LOG10E,
  SQRT1_2: Math.SQRT1_2,
  SQRT2: Math.SQRT2
};
class c {
  static throwIfNotNumber(r) {
    const t = typeof r;
    if (t !== "number")
      throw new Error("Math operators required type of number: given is " + t);
  }
}
class $ {
  static throwIfNotNumber(r) {
    const t = typeof r;
    if (t !== "number")
      throw new Error("Math functions required type of number: given is " + t);
  }
}
class u {
  static createOperatorExpression(r, t, e) {
    if (r === "^")
      return new b(t, e);
    if (r === "*" || r === "/")
      return new g(r, t, e);
    if (r === "+" || r === "-")
      return new E(r, t, e);
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
  constructor(t) {
    super();
    n(this, "innerExpression");
    if (this.innerExpression = t, !(this.innerExpression instanceof u))
      throw new Error("No inner expression given for bracket expression");
  }
  evaluate(t = {}) {
    return this.innerExpression.evaluate(t);
  }
  toString() {
    return `(${this.innerExpression.toString()})`;
  }
}
class f extends u {
  constructor(t, e = "number") {
    super();
    n(this, "value");
    n(this, "type");
    switch (this.value = Number(t), e) {
      case "number":
        if (this.value = Number(t), isNaN(this.value))
          throw new Error("Cannot parse number: " + t);
        break;
      case "string":
        this.value = String(t);
        break;
      default:
        throw new Error("Invalid value type: " + e);
    }
    this.type = e;
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
class E extends u {
  constructor(t, e, i) {
    super();
    n(this, "operator");
    n(this, "left");
    n(this, "right");
    if (!["+", "-"].includes(t))
      throw new Error(`Operator not allowed in Plus/Minus expression: ${t}`);
    this.operator = t, this.left = e, this.right = i;
  }
  evaluate(t = {}) {
    const e = Number(this.left.evaluate(t)), i = Number(this.right.evaluate(t));
    if (c.throwIfNotNumber(e), c.throwIfNotNumber(i), this.operator === "+")
      return e + i;
    if (this.operator === "-")
      return e - i;
    throw new Error("Unknown operator for PlusMinus expression");
  }
  toString() {
    return `${this.left.toString()} ${this.operator} ${this.right.toString()}`;
  }
}
class g extends u {
  constructor(t, e, i) {
    super();
    n(this, "operator");
    n(this, "left");
    n(this, "right");
    if (!["*", "/"].includes(t))
      throw new Error(`Operator not allowed in Multiply/Division expression: ${t}`);
    this.operator = t, this.left = e, this.right = i;
  }
  evaluate(t = {}) {
    const e = Number(this.left.evaluate(t)), i = Number(this.right.evaluate(t));
    if (c.throwIfNotNumber(e), c.throwIfNotNumber(i), this.operator === "*")
      return e * i;
    if (this.operator === "/")
      return e / i;
    throw new Error("Unknown operator for MultDiv expression");
  }
  toString() {
    return `${this.left.toString()} ${this.operator} ${this.right.toString()}`;
  }
}
class b extends u {
  constructor(t, e) {
    super();
    n(this, "base");
    n(this, "exponent");
    this.base = t, this.exponent = e;
  }
  evaluate(t = {}) {
    const e = Number(this.base.evaluate(t)), i = Number(this.exponent.evaluate(t));
    return c.throwIfNotNumber(e), c.throwIfNotNumber(i), Math.pow(e, i);
  }
  toString() {
    return `${this.base.toString()}^${this.exponent.toString()}`;
  }
}
class S extends u {
  constructor(t, e, i = null) {
    super();
    n(this, "fn");
    n(this, "varPath");
    n(this, "argumentExpressions");
    n(this, "formulaObject");
    n(this, "blacklisted");
    this.fn = t != null ? t : "", this.varPath = this.fn.split("."), this.argumentExpressions = e || [], this.formulaObject = i, this.blacklisted = void 0;
  }
  evaluate(t = {}) {
    var a;
    t = t || {};
    const e = this.argumentExpressions.map((s) => s.evaluate(t));
    try {
      let s = w(t, this.varPath, this.fn);
      if (s instanceof Function)
        return s.apply(this, e);
    } catch (s) {
    }
    let i;
    try {
      i = w((a = this.formulaObject) != null ? a : {}, this.varPath, this.fn);
    } catch (s) {
    }
    if (this.formulaObject && i instanceof Function) {
      if (this.isBlacklisted())
        throw new Error("Blacklisted function called: " + this.fn);
      return i.apply(this.formulaObject, e);
    }
    try {
      const s = w(Math, this.varPath, this.fn);
      if (s instanceof Function)
        return e.forEach((o) => {
          $.throwIfNotNumber(o);
        }), s.apply(this, e);
    } catch (s) {
    }
    throw new Error("Function not found: " + this.fn);
  }
  toString() {
    return `${this.fn}(${this.argumentExpressions.map((t) => t.toString()).join(", ")})`;
  }
  isBlacklisted() {
    return this.blacklisted === void 0 && (this.blacklisted = y.functionBlacklist.includes(
      this.formulaObject ? this.formulaObject[this.fn] : null
    )), this.blacklisted;
  }
}
function w(h, r, t) {
  let e = h;
  for (let i of r) {
    if (typeof e != "object")
      throw new Error(`Cannot evaluate ${i}, property not found (from path ${t})`);
    if (e[i] === void 0)
      throw new Error(`Cannot evaluate ${i}, property not found (from path ${t})`);
    e = e[i];
  }
  if (typeof e == "object")
    throw new Error("Invalid value");
  return e;
}
class d extends u {
  constructor(t, e = null) {
    super();
    n(this, "fullPath");
    n(this, "varPath");
    n(this, "formulaObject");
    this.formulaObject = e, this.fullPath = t, this.varPath = t.split(".");
  }
  evaluate(t = {}) {
    var i;
    let e;
    try {
      e = w(t, this.varPath, this.fullPath);
    } catch (a) {
    }
    if (e === void 0 && (e = w((i = this.formulaObject) != null ? i : {}, this.varPath, this.fullPath)), typeof e == "function" || typeof e == "object")
      throw new Error(`Cannot use ${this.fullPath} as value: It contains a non-numerical value.`);
    return e;
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
  constructor(r, t = {}) {
    n(this, "formulaExpression");
    n(this, "options");
    n(this, "formulaStr");
    n(this, "_variables");
    n(this, "_memory");
    this.formulaExpression = null, this.options = { memoization: !1, ...t }, this.formulaStr = "", this._variables = [], this._memory = {}, this.setFormula(r);
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
    let t = 0, e = "";
    const i = [];
    for (let a of r.split(""))
      if (a === "," && t === 0)
        i.push(e), e = "";
      else if (a === "(")
        t++, e += a;
      else if (a === ")") {
        if (t--, e += a, t < 0)
          throw new Error("ERROR: Too many closing parentheses!");
      } else
        e += a;
    if (t !== 0)
      throw new Error("ERROR: Too many opening parentheses!");
    return e.length > 0 && i.push(e), i;
  }
  /**
   * Cleans the input string from unnecessary whitespace,
   * and replaces some known constants:
   */
  cleanupInputFormula(r) {
    const t = [];
    return r.split('"').forEach((i, a) => {
      a % 2 === 0 && (i = i.replace(/[\s]+/g, ""), Object.keys(m).forEach((s) => {
        i = i.replace(new RegExp(`\\b${s}\\b`, "g"), `[${s}]`);
      })), t.push(i);
    }), t.join('"');
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
  parse(r) {
    return r = this.cleanupInputFormula(r), this._do_parse(r);
  }
  /**
   * @see parse(): this is the recursive parse function, without the clean string part.
   * @param {String} str
   * @returns {Expression} An expression object, representing the expression tree
   */
  _do_parse(r) {
    let t = r.length - 1, e = 0, i = "initial", a = [], s = "", o = "", x = null, p = 0, v = !1;
    for (; e <= t; ) {
      switch (i) {
        case "initial":
          if (s = r.charAt(e), s.match(/[0-9.]/))
            i = "within-nr", o = "", e--;
          else if (this.isOperator(s)) {
            if (s === "-" && (a.length === 0 || this.isOperatorExpr(a[a.length - 1]))) {
              i = "within-nr", o = "-";
              break;
            }
            if (e === t || this.isOperatorExpr(a[a.length - 1])) {
              i = "invalid";
              break;
            } else
              a.push(
                u.createOperatorExpression(s, new u(), new u())
              ), i = "initial";
          } else
            s === "(" ? (i = "within-parentheses", o = "", p = 0) : s === "[" ? (i = "within-named-var", o = "") : s === '"' ? (i = "within-string", o = "") : s.match(/[a-zA-Z]/) && (e < t && r.charAt(e + 1).match(/[a-zA-Z0-9_.]/) ? (o = s, i = "within-func") : (a.length > 0 && a[a.length - 1] instanceof f && a.push(
              u.createOperatorExpression("*", new u(), new u())
            ), a.push(new d(s, this)), this.registerVariable(s), i = "initial", o = ""));
          break;
        case "within-nr":
          s = r.charAt(e), s.match(/[0-9.]/) ? (o += s, e === t && (a.push(new f(o)), i = "initial")) : (o === "-" && (o = "-1"), a.push(new f(o)), o = "", i = "initial", e--);
          break;
        case "within-func":
          if (s = r.charAt(e), s.match(/[a-zA-Z0-9_.]/))
            o += s;
          else if (s === "(")
            x = o, o = "", p = 0, i = "within-func-parentheses";
          else
            throw new Error("Wrong character for function at position " + e);
          break;
        case "within-named-var":
          if (s = r.charAt(e), s === "]")
            a.push(new d(o, this)), this.registerVariable(o), o = "", i = "initial";
          else if (s.match(/[a-zA-Z0-9_.]/))
            o += s;
          else
            throw new Error("Character not allowed within named variable: " + s);
          break;
        case "within-string":
          s = r.charAt(e), s === '"' ? (a.push(new f(o, "string")), o = "", i = "initial") : o += s;
          break;
        case "within-parentheses":
        case "within-func-parentheses":
          if (s = r.charAt(e), v)
            s === '"' && (v = !1), o += s;
          else if (s === ")")
            if (p <= 0) {
              if (i === "within-parentheses")
                a.push(new N(this._do_parse(o)));
              else if (i === "within-func-parentheses") {
                let M = this.splitFunctionParams(o).map((k) => this._do_parse(k));
                a.push(new S(x, M, this)), x = null;
              }
              i = "initial";
            } else
              p--, o += s;
          else
            s === "(" ? (p++, o += s) : (s === '"' && (v = !0), o += s);
          break;
      }
      e++;
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
    const t = [...r];
    let e = 0, i = null;
    for (; e < t.length; )
      if (i = t[e], i instanceof b) {
        if (e === 0 || e === t.length - 1)
          throw new Error("Wrong operator position!");
        i.base = t[e - 1], i.exponent = t[e + 1], t[e - 1] = i, t.splice(e, 2);
      } else
        e++;
    for (e = 0, i = null; e < t.length; )
      if (i = t[e], i instanceof g) {
        if (e === 0 || e === t.length - 1)
          throw new Error("Wrong operator position!");
        i.left = t[e - 1], i.right = t[e + 1], t[e - 1] = i, t.splice(e, 2);
      } else
        e++;
    for (e = 0, i = null; e < t.length; )
      if (i = t[e], i instanceof E) {
        if (e === 0 || e === t.length - 1)
          throw new Error("Wrong operator position!");
        i.left = t[e - 1], i.right = t[e + 1], t[e - 1] = i, t.splice(e, 2);
      } else
        e++;
    if (t.length !== 1)
      throw new Error("Could not parse formula: incorrect syntax?");
    return t[0];
  }
  isOperator(r) {
    return typeof r == "string" && r.match(/[+\-*/^]/);
  }
  isOperatorExpr(r) {
    return r instanceof E || r instanceof g || r instanceof b;
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
   * @return {Number|Array<Number>} The evaluated result, or an array with results
   */
  evaluate(r) {
    if (r instanceof Array)
      return r.map((e) => this.evaluate(e));
    let t = this.getExpression();
    if (!(t instanceof u))
      throw new Error("No expression set: Did you init the object with a Formula?");
    if (this.options.memoization) {
      let e = this.resultFromMemory(r);
      return e !== null || (e = Number(t.evaluate({ ...m, ...r })), this.storeInMemory(r, e)), e;
    }
    return Number(t.evaluate({ ...m, ...r }));
  }
  hashValues(r) {
    return JSON.stringify(r);
  }
  resultFromMemory(r) {
    let t = this.hashValues(r), e = this._memory[t];
    return e !== void 0 ? e : null;
  }
  storeInMemory(r, t) {
    this._memory[this.hashValues(r)] = t;
  }
  getExpression() {
    return this.formulaExpression;
  }
  getExpressionString() {
    return this.formulaExpression ? this.formulaExpression.toString() : "";
  }
  static calc(r, t = null, e = {}) {
    return t = t != null ? t : {}, new l(r, e).evaluate(t);
  }
};
n(l, "Expression", u), n(l, "BracketExpression", N), n(l, "PowerExpression", b), n(l, "MultDivExpression", g), n(l, "PlusMinusExpression", E), n(l, "ValueExpression", f), n(l, "VariableExpression", d), n(l, "FunctionExpression", S), n(l, "MATH_CONSTANTS", m), // Create a function blacklist:
n(l, "functionBlacklist", Object.getOwnPropertyNames(l.prototype).filter((r) => l.prototype[r] instanceof Function).map((r) => l.prototype[r]));
let y = l;
export {
  y as default
};
//# sourceMappingURL=fparser.js.map
