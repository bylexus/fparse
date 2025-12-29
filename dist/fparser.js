var R = Object.defineProperty;
var A = (o, e, t) => e in o ? R(o, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : o[e] = t;
var r = (o, e, t) => (A(o, typeof e != "symbol" ? e + "" : e, t), t);
function f(o, e, t) {
  let i = o, s = null;
  for (let n of e) {
    if (!["object", "string"].includes(typeof i))
      throw new Error(`Cannot evaluate ${n}, property not found (from path ${t})`);
    if (typeof i == "object" && !(n in i))
      throw new Error(`Cannot evaluate ${n}, property not found (from path ${t})`);
    if (typeof i == "string" && !i.hasOwnProperty(n))
      throw new Error(`Cannot evaluate ${n}, property not found (from path ${t})`);
    s = i, i = i[n];
  }
  if (typeof i == "object" && !(i instanceof Array))
    throw new Error("Invalid value");
  return typeof i == "function" && s && (i = i.bind(s)), i;
}
class P {
  static throwIfNotNumber(e) {
    if (typeof e === "string")
      throw new Error("Strings are not allowed in math operations");
  }
}
class c {
  static throwIfNotNumber(e) {
    if (typeof e === "string")
      throw new Error("Strings are not allowed in math operations");
  }
}
class u {
  /**
   * Creates an operator expression from a token.
   * @param operatorToken The operator token (or string for backward compatibility)
   * @param left Left operand expression
   * @param right Right operand expression
   */
  static createOperatorExpression(e, t, i) {
    const s = typeof e == "string" ? e : String(e.value);
    if (s === "^")
      return new O(t, i);
    if (["*", "/"].includes(s))
      return new E(s, t, i);
    if (["+", "-"].includes(s))
      return new m(s, t, i);
    if (["<", ">", "<=", ">=", "=", "!="].includes(s))
      return new l(s, t, i);
    throw new Error(`Unknown operator: ${s}`);
  }
  toString() {
    return "";
  }
}
class N extends u {
  constructor(t) {
    super();
    r(this, "innerExpression");
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
class w extends u {
  constructor(t, i = "number") {
    super();
    r(this, "value");
    r(this, "type");
    switch (this.value = Number(t), i) {
      case "number":
        if (this.value = Number(t), isNaN(this.value))
          throw new Error("Cannot parse number: " + t);
        break;
      case "string":
        this.value = String(t);
        break;
      default:
        throw new Error("Invalid value type: " + i);
    }
    this.type = i;
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
class m extends u {
  constructor(t, i, s) {
    super();
    r(this, "operator");
    r(this, "left");
    r(this, "right");
    if (!["+", "-"].includes(t))
      throw new Error(`Operator not allowed in Plus/Minus expression: ${t}`);
    this.operator = t, this.left = i, this.right = s;
  }
  evaluate(t = {}) {
    const i = this.left.evaluate(t), s = this.right.evaluate(t);
    if (c.throwIfNotNumber(i), c.throwIfNotNumber(s), this.operator === "+")
      return Number(i) + Number(s);
    if (this.operator === "-")
      return Number(i) - Number(s);
    throw new Error("Unknown operator for PlusMinus expression");
  }
  toString() {
    return `${this.left.toString()} ${this.operator} ${this.right.toString()}`;
  }
}
r(m, "PLUS", "+"), r(m, "MINUS", "-");
class E extends u {
  constructor(t, i, s) {
    super();
    r(this, "operator");
    r(this, "left");
    r(this, "right");
    if (!["*", "/"].includes(t))
      throw new Error(`Operator not allowed in Multiply/Division expression: ${t}`);
    this.operator = t, this.left = i, this.right = s;
  }
  evaluate(t = {}) {
    const i = this.left.evaluate(t), s = this.right.evaluate(t);
    if (c.throwIfNotNumber(i), c.throwIfNotNumber(s), this.operator === "*")
      return Number(i) * Number(s);
    if (this.operator === "/")
      return Number(i) / Number(s);
    throw new Error("Unknown operator for MultDiv expression");
  }
  toString() {
    return `${this.left.toString()} ${this.operator} ${this.right.toString()}`;
  }
}
r(E, "MULT", "*"), r(E, "DIV", "/");
class O extends u {
  constructor(t, i) {
    super();
    r(this, "base");
    r(this, "exponent");
    this.base = t, this.exponent = i;
  }
  evaluate(t = {}) {
    const i = this.base.evaluate(t), s = this.exponent.evaluate(t);
    return c.throwIfNotNumber(i), c.throwIfNotNumber(s), Math.pow(Number(i), Number(s));
  }
  toString() {
    return `${this.base.toString()}^${this.exponent.toString()}`;
  }
}
class l extends u {
  constructor(t, i, s) {
    super();
    r(this, "operator");
    r(this, "left");
    r(this, "right");
    if (!["<", ">", "<=", ">=", "=", "!="].includes(t))
      throw new Error(`Operator not allowed in Logical expression: ${t}`);
    this.operator = t, this.left = i, this.right = s;
  }
  evaluate(t = {}) {
    const i = this.left.evaluate(t), s = this.right.evaluate(t);
    switch (this.operator) {
      case "<":
        return i < s ? 1 : 0;
      case ">":
        return i > s ? 1 : 0;
      case "<=":
        return i <= s ? 1 : 0;
      case ">=":
        return i >= s ? 1 : 0;
      case "=":
        return i === s ? 1 : 0;
      case "!=":
        return i !== s ? 1 : 0;
    }
    throw new Error("Unknown operator for Logical expression");
  }
  toString() {
    return `${this.left.toString()} ${this.operator} ${this.right.toString()}`;
  }
}
r(l, "LT", "<"), r(l, "GT", ">"), r(l, "LTE", "<="), r(l, "GTE", ">="), r(l, "EQ", "="), r(l, "NEQ", "!=");
class b extends u {
  constructor(t, i, s = null) {
    super();
    r(this, "fn");
    r(this, "varPath");
    r(this, "argumentExpressions");
    r(this, "formulaObject");
    r(this, "blacklisted");
    this.fn = t ?? "", this.varPath = this.fn.split("."), this.argumentExpressions = i || [], this.formulaObject = s, this.blacklisted = void 0;
  }
  evaluate(t = {}) {
    t = t || {};
    const i = this.argumentExpressions.map((n) => n.evaluate(t));
    try {
      let n = f(t, this.varPath, this.fn);
      if (n instanceof Function)
        return n.apply(this, i);
    } catch {
    }
    let s;
    try {
      s = f(this.formulaObject ?? {}, this.varPath, this.fn);
    } catch {
    }
    if (this.formulaObject && s instanceof Function) {
      if (this.isBlacklisted())
        throw new Error("Blacklisted function called: " + this.fn);
      return s.apply(this.formulaObject, i);
    }
    try {
      const n = f(Math, this.varPath, this.fn);
      if (n instanceof Function)
        return i.forEach((p) => {
          P.throwIfNotNumber(p);
        }), n.apply(this, i);
    } catch {
    }
    throw new Error("Function not found: " + this.fn);
  }
  toString() {
    return `${this.fn}(${this.argumentExpressions.map((t) => t.toString()).join(", ")})`;
  }
  isBlacklisted() {
    return this.blacklisted === void 0 && (this.blacklisted = v.functionBlacklist.includes(
      this.formulaObject ? this.formulaObject[this.fn] : null
    )), this.blacklisted;
  }
}
class k extends u {
  constructor(t, i = null) {
    super();
    r(this, "fullPath");
    r(this, "varPath");
    r(this, "formulaObject");
    this.formulaObject = i, this.fullPath = t, this.varPath = t.split(".");
  }
  evaluate(t = {}) {
    let i;
    try {
      i = f(t, this.varPath, this.fullPath);
    } catch {
    }
    if (i === void 0 && (i = f(this.formulaObject ?? {}, this.varPath, this.fullPath)), typeof i == "function" || typeof i == "object")
      throw new Error(`Cannot use ${this.fullPath} as value: It contains a non-numerical value.`);
    return i;
  }
  toString() {
    return `${this.varPath.join(".")}`;
  }
}
var a = /* @__PURE__ */ ((o) => (o.NUMBER = "NUMBER", o.VARIABLE = "VARIABLE", o.OPERATOR = "OPERATOR", o.LOGICAL_OPERATOR = "LOGICAL_OPERATOR", o.FUNCTION = "FUNCTION", o.LEFT_PAREN = "LEFT_PAREN", o.RIGHT_PAREN = "RIGHT_PAREN", o.COMMA = "COMMA", o.STRING = "STRING", o.EOF = "EOF", o))(a || {});
class y {
  constructor() {
    r(this, "input");
    r(this, "position");
    this.input = "", this.position = 0;
  }
  tokenize(e) {
    this.input = e, this.position = 0;
    const t = [];
    for (; this.position < this.input.length && (this.skipWhitespace(), !(this.position >= this.input.length)); ) {
      const i = this.nextToken(t);
      i && t.push(i);
    }
    return t.push({
      type: "EOF",
      value: "",
      raw: "",
      position: this.position,
      length: 0
    }), t;
  }
  nextToken(e) {
    return this.readString() || this.readLogicalOperator() || this.readNumber(e) || this.readOperator() || this.readParenthesis() || this.readComma() || this.readIdentifier() || this.throwUnexpectedChar();
  }
  skipWhitespace() {
    for (; this.position < this.input.length && /\s/.test(this.input[this.position]); )
      this.position++;
  }
  peek(e = 0) {
    return this.input[this.position + e] || "";
  }
  /**
   * Read a number token. Includes the minus sign if it's unambiguously part of the number.
   * Handles negative numbers when preceded by operators, commas, left parenthesis, or at start.
   */
  readNumber(e) {
    const t = this.position;
    let i = "";
    if (this.peek() === "-") {
      const n = e.length > 0 ? e[e.length - 1] : null;
      if ((!n || n.type === "OPERATOR" || n.type === "LOGICAL_OPERATOR" || n.type === "COMMA" || n.type === "LEFT_PAREN") && /\d/.test(this.peek(1)))
        i += this.peek(), this.position++;
      else
        return null;
    }
    if (!/\d/.test(this.peek()))
      return i === "-" && (this.position = t), null;
    for (; /\d/.test(this.peek()); )
      i += this.peek(), this.position++;
    if (this.peek() === ".")
      for (i += this.peek(), this.position++; /\d/.test(this.peek()); )
        i += this.peek(), this.position++;
    return {
      type: "NUMBER",
      value: parseFloat(i),
      raw: i,
      position: t,
      length: this.position - t
    };
  }
  /**
   * Read an identifier (variable or function name).
   * Supports: myVar, x, PI, my_var, obj.prop, [myVar], [obj.prop]
   */
  readIdentifier() {
    const e = this.position;
    let t = "", i = "", s = !1;
    if (this.peek() === "[") {
      for (s = !0, t += this.peek(), this.position++; this.position < this.input.length && this.peek() !== "]"; ) {
        if (!/[a-zA-Z0-9_.]/.test(this.peek()))
          throw new Error(
            `Invalid character '${this.peek()}' in bracketed variable at position ${this.position}`
          );
        i += this.peek(), t += this.peek(), this.position++;
      }
      if (this.peek() !== "]")
        throw new Error(`Unclosed bracket for variable at position ${e}`);
      t += this.peek(), this.position++;
    } else {
      if (!/[a-zA-Z_]/.test(this.peek()))
        return null;
      for (; /[a-zA-Z0-9_.]/.test(this.peek()); )
        i += this.peek(), t += this.peek(), this.position++;
    }
    if (i === "") {
      if (s)
        throw new Error(`Empty bracketed variable at position ${e}`);
      return null;
    }
    let n = this.position;
    this.skipWhitespace();
    const p = this.peek() === "(";
    return this.position = n, {
      type: p ? "FUNCTION" : "VARIABLE",
      value: i,
      raw: t,
      position: e,
      length: this.position - e
    };
  }
  /**
   * Read a string literal (single or double quoted).
   * Supports escaped quotes: \" or \'
   */
  readString() {
    const e = this.position, t = this.peek();
    if (t !== '"' && t !== "'")
      return null;
    let i = t, s = "";
    for (this.position++; this.position < this.input.length; ) {
      const n = this.peek();
      if (n === "\\" && (this.peek(1) === t || this.peek(1) === "\\")) {
        const p = this.peek(1);
        i += n + p, s += p, this.position += 2;
      } else if (n === t) {
        i += n, this.position++;
        break;
      } else
        i += n, s += n, this.position++;
    }
    if (!i.endsWith(t))
      throw new Error(`Unterminated string at position ${e}`);
    return {
      type: "STRING",
      value: s,
      raw: i,
      position: e,
      length: this.position - e
    };
  }
  /**
   * Read a simple operator: +, -, *, /, ^
   */
  readOperator() {
    const e = this.peek();
    if (!/[+\-*/^]/.test(e))
      return null;
    const i = this.position;
    return this.position++, {
      type: "OPERATOR",
      value: e,
      raw: e,
      position: i,
      length: 1
    };
  }
  /**
   * Read a logical operator: <, >, <=, >=, =, !=
   */
  readLogicalOperator() {
    const e = this.position, t = this.peek(), i = this.peek(1);
    if (t === "<" && i === "=" || t === ">" && i === "=" || t === "!" && i === "=") {
      const s = t + i;
      return this.position += 2, {
        type: "LOGICAL_OPERATOR",
        value: s,
        raw: s,
        position: e,
        length: 2
      };
    }
    if (t === "<" || t === ">" || t === "=")
      return this.position++, {
        type: "LOGICAL_OPERATOR",
        value: t,
        raw: t,
        position: e,
        length: 1
      };
    if (t === "!")
      throw new Error(`Invalid operator '!' at position ${e}. Did you mean '!='?`);
    return null;
  }
  /**
   * Read parentheses
   */
  readParenthesis() {
    const e = this.peek(), t = this.position;
    return e === "(" ? (this.position++, {
      type: "LEFT_PAREN",
      value: "(",
      raw: "(",
      position: t,
      length: 1
    }) : e === ")" ? (this.position++, {
      type: "RIGHT_PAREN",
      value: ")",
      raw: ")",
      position: t,
      length: 1
    }) : null;
  }
  /**
   * Read comma separator
   */
  readComma() {
    const e = this.peek(), t = this.position;
    return e === "," ? (this.position++, {
      type: "COMMA",
      value: ",",
      raw: ",",
      position: t,
      length: 1
    }) : null;
  }
  /**
   * Throw an error for unexpected characters
   */
  throwUnexpectedChar() {
    const e = this.peek();
    throw new Error(`Unexpected character '${e}' at position ${this.position}`);
  }
}
const g = {
  // Logical operators (lowest precedence)
  "=": 1,
  "!=": 1,
  "<": 1,
  ">": 1,
  "<=": 1,
  ">=": 1,
  // Addition/Subtraction
  "+": 2,
  "-": 2,
  // Multiplication/Division
  "*": 3,
  "/": 3,
  // Power (highest precedence, right-associative)
  "^": 4
};
class I {
  constructor(e, t) {
    r(this, "tokens");
    r(this, "current");
    r(this, "formulaObject");
    this.tokens = e, this.current = 0, this.formulaObject = t;
  }
  /**
   * Main entry point: Parse the token stream into an Expression tree
   */
  parse() {
    const e = this.parseExpression(0);
    if (!this.isAtEnd()) {
      const t = this.peek();
      throw new Error(
        `Unexpected token '${t.value}' at position ${t.position}: Expected end of expression`
      );
    }
    return e;
  }
  /**
   * Pratt parsing: handles operator precedence elegantly
   * @param minPrecedence Minimum precedence level to parse
   */
  parseExpression(e) {
    let t = this.parsePrimary();
    for (; !this.isAtEnd(); ) {
      const i = this.peek();
      if (i.type !== a.OPERATOR && i.type !== a.LOGICAL_OPERATOR)
        break;
      const s = this.getPrecedence(i);
      if (s < e)
        break;
      const p = i.value === "^" ? s : s + 1;
      this.consume();
      const x = this.parseExpression(p);
      t = u.createOperatorExpression(
        i,
        t,
        x
      );
    }
    return t;
  }
  /**
   * Parse primary expressions: numbers, variables, functions, parentheses, unary operators
   */
  parsePrimary() {
    const e = this.peek();
    if (this.match(a.OPERATOR) && e.value === "-") {
      this.consume();
      const t = this.parsePrimary();
      return new E("*", new w(-1), t);
    }
    if (this.match(a.OPERATOR) && e.value === "+")
      return this.consume(), this.parsePrimary();
    if (this.match(a.NUMBER))
      return this.consume(), new w(e.value);
    if (this.match(a.STRING))
      return this.consume(), new w(e.value, "string");
    if (this.match(a.LEFT_PAREN))
      return this.parseParenthesizedExpression();
    if (this.match(a.VARIABLE, a.FUNCTION))
      return this.parseVariableOrFunction();
    throw new Error(
      `Unexpected token '${e.value}' at position ${e.position}: Expected number, variable, function, or '('`
    );
  }
  /**
   * Parse a parenthesized expression: (expr)
   */
  parseParenthesizedExpression() {
    const e = this.consume(a.LEFT_PAREN), t = this.parseExpression(0);
    if (!this.match(a.RIGHT_PAREN)) {
      const i = this.peek();
      throw new Error(
        `Missing closing parenthesis at position ${i.position}: Expected ')' to match '(' at position ${e.position}`
      );
    }
    return this.consume(a.RIGHT_PAREN), new N(t);
  }
  /**
   * Parse a variable or function call
   */
  parseVariableOrFunction() {
    const e = this.consume(), t = e.value;
    return this.match(a.LEFT_PAREN) ? this.parseFunctionCall(t, e.position) : (this.formulaObject.registerVariable(t), new k(t, this.formulaObject));
  }
  /**
   * Parse a function call: functionName(arg1, arg2, ...)
   */
  parseFunctionCall(e, t) {
    const i = this.consume(a.LEFT_PAREN), s = [];
    if (!this.match(a.RIGHT_PAREN))
      do
        s.push(this.parseExpression(0));
      while (this.matchAndConsume(a.COMMA));
    if (!this.match(a.RIGHT_PAREN)) {
      const n = this.peek();
      throw new Error(
        `Missing closing parenthesis for function '${e}' at position ${n.position}: Expected ')' to match '(' at position ${i.position}`
      );
    }
    return this.consume(a.RIGHT_PAREN), new b(e, s, this.formulaObject);
  }
  // ==================== Helper Methods ====================
  /**
   * Get the current token without consuming it
   */
  peek() {
    return this.tokens[this.current];
  }
  /**
   * Consume the current token and move to the next one
   * @param expected Optional: throw error if current token is not of this type
   */
  consume(e) {
    const t = this.peek();
    if (e && t.type !== e)
      throw new Error(
        `Expected ${e} at position ${t.position}, got ${t.type} ('${t.value}')`
      );
    return this.current++, t;
  }
  /**
   * Check if the current token matches any of the given types
   */
  match(...e) {
    return e.includes(this.peek().type);
  }
  /**
   * If the current token matches the given type, consume it and return true
   */
  matchAndConsume(e) {
    return this.match(e) ? (this.consume(), !0) : !1;
  }
  /**
   * Check if we've reached the end of the token stream
   */
  isAtEnd() {
    return this.peek().type === a.EOF;
  }
  /**
   * Get the precedence level for a token
   */
  getPrecedence(e) {
    if (e.type === a.LOGICAL_OPERATOR) {
      const t = e.value;
      return g[t] ?? 0;
    }
    if (e.type === a.OPERATOR) {
      const t = e.value;
      return g[t] ?? 0;
    }
    return 0;
  }
}
const d = {
  PI: Math.PI,
  E: Math.E,
  LN2: Math.LN2,
  LN10: Math.LN10,
  LOG2E: Math.LOG2E,
  LOG10E: Math.LOG10E,
  SQRT1_2: Math.SQRT1_2,
  SQRT2: Math.SQRT2
}, h = class h {
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
  constructor(e, t = {}) {
    r(this, "formulaExpression");
    r(this, "options");
    r(this, "formulaStr");
    r(this, "_variables");
    r(this, "_memory");
    this.formulaExpression = null, this.options = { memoization: !1, ...t }, this.formulaStr = "", this._variables = [], this._memory = {}, this.setFormula(e);
  }
  /**
   * Re-sets the given String and parses it to a formula expression. Can be used after initialization,
   * to re-use the Formula object.
   *
   * @param {String} formulaString The formula string to set/parse
   * @return {this} The Formula object (this)
   */
  setFormula(e) {
    return e && (this.formulaExpression = null, this._variables = [], this._memory = {}, this.formulaStr = e, this.formulaExpression = this.parse(e)), this;
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
   * Parses the given formula string into an Abstract Syntax Tree (AST).
   *
   * The parsing is done in two phases:
   * 1. Tokenization: Convert the input string into a stream of tokens
   * 2. Parsing: Convert the token stream into an Expression tree using Pratt parsing
   *
   * Example: "2 + 3 * sin(PI * x)" is tokenized into:
   *   [NUMBER(2), OPERATOR(+), NUMBER(3), OPERATOR(*), FUNCTION(sin), ...]
   * Then parsed into an expression tree:
   *  ```
   *         root expr:  (+)
   *                     / \
   *                    2    (*)
   *                        / \
   *                       3   functionExpr(sin, [PI*x])
   * ```
   *
   * @param {String} str The formula string, e.g. '3*sin(PI/x)'
   * @returns {Expression} An expression object, representing the expression tree
   */
  parse(e) {
    const i = new y().tokenize(e);
    return new I(i, this).parse();
  }
  registerVariable(e) {
    this._variables.indexOf(e) < 0 && this._variables.push(e);
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
  evaluate(e) {
    if (e instanceof Array)
      return e.map((i) => this.evaluate(i));
    let t = this.getExpression();
    if (!(t instanceof u))
      throw new Error("No expression set: Did you init the object with a Formula?");
    if (this.options.memoization) {
      let i = this.resultFromMemory(e);
      return i !== null || (i = t.evaluate({ ...d, ...e }), this.storeInMemory(e, i)), i;
    }
    return t.evaluate({ ...d, ...e });
  }
  hashValues(e) {
    return JSON.stringify(e);
  }
  resultFromMemory(e) {
    let t = this.hashValues(e), i = this._memory[t];
    return i !== void 0 ? i : null;
  }
  storeInMemory(e, t) {
    this._memory[this.hashValues(e)] = t;
  }
  getExpression() {
    return this.formulaExpression;
  }
  getExpressionString() {
    return this.formulaExpression ? this.formulaExpression.toString() : "";
  }
  static calc(e, t = null, i = {}) {
    return t = t ?? {}, new h(e, i).evaluate(t);
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
  ifElse(e, t, i) {
    return e ? t : i;
  }
  first(...e) {
    for (const t of e)
      if (t instanceof Array) {
        let i = this.first(...t);
        if (i)
          return i;
      } else if (t)
        return t;
    if (e.length > 0) {
      const t = e[e.length - 1];
      return t instanceof Array ? this.first(...t) : t;
    }
    throw new Error("first(): At least one argument is required");
  }
};
r(h, "Expression", u), r(h, "BracketExpression", N), r(h, "PowerExpression", O), r(h, "MultDivExpression", E), r(h, "PlusMinusExpression", m), r(h, "LogicalExpression", l), r(h, "ValueExpression", w), r(h, "VariableExpression", k), r(h, "FunctionExpression", b), r(h, "MATH_CONSTANTS", d), r(h, "ALLOWED_FUNCTIONS", ["ifElse", "first"]), // Create a function blacklist:
r(h, "functionBlacklist", Object.getOwnPropertyNames(h.prototype).filter((e) => h.prototype[e] instanceof Function && !h.ALLOWED_FUNCTIONS.includes(e)).map((e) => h.prototype[e]));
let v = h;
export {
  I as Parser,
  a as TokenType,
  y as Tokenizer,
  v as default
};
//# sourceMappingURL=fparser.js.map
