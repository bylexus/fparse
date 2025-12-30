var L = Object.defineProperty;
var M = (n, i, t) => i in n ? L(n, i, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[i] = t;
var r = (n, i, t) => (M(n, typeof i != "symbol" ? i + "" : i, t), t);
function m(n, i, t) {
  let e = n, s = null;
  for (let o of i) {
    if (!["object", "string"].includes(typeof e))
      throw new Error(`Cannot evaluate ${o}, property not found (from path ${t})`);
    if (typeof e == "object" && !(o in e))
      throw new Error(`Cannot evaluate ${o}, property not found (from path ${t})`);
    if (typeof e == "string" && !e.hasOwnProperty(o))
      throw new Error(`Cannot evaluate ${o}, property not found (from path ${t})`);
    s = e, e = e[o];
  }
  return typeof e == "function" && s && (e = e.bind(s)), e;
}
class $ {
  static throwIfNotNumber(i) {
    if (typeof i === "string")
      throw new Error("Strings are not allowed in math operations");
  }
}
class E {
  static throwIfNotNumber(i) {
    if (typeof i === "string")
      throw new Error("Strings are not allowed in math operations");
  }
}
class p {
  /**
   * Creates an operator expression from a token.
   * @param operatorToken The operator token (or string for backward compatibility)
   * @param left Left operand expression
   * @param right Right operand expression
   */
  static createOperatorExpression(i, t, e) {
    const s = typeof i == "string" ? i : String(i.value);
    if (s === "^")
      return new I(t, e);
    if (["*", "/"].includes(s))
      return new g(s, t, e);
    if (["+", "-"].includes(s))
      return new N(s, t, e);
    if (["<", ">", "<=", ">=", "=", "!="].includes(s))
      return new f(s, t, e);
    throw new Error(`Unknown operator: ${s}`);
  }
  toString() {
    return "";
  }
}
class x extends p {
  constructor(t) {
    super();
    r(this, "innerExpression");
    if (this.innerExpression = t, !(this.innerExpression instanceof p))
      throw new Error("No inner expression given for bracket expression");
  }
  evaluate(t = {}) {
    return this.innerExpression.evaluate(t);
  }
  toString() {
    return `(${this.innerExpression.toString()})`;
  }
}
class w extends p {
  constructor(t, e = "number") {
    super();
    r(this, "value");
    r(this, "type");
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
class N extends p {
  constructor(t, e, s) {
    super();
    r(this, "operator");
    r(this, "left");
    r(this, "right");
    if (!["+", "-"].includes(t))
      throw new Error(`Operator not allowed in Plus/Minus expression: ${t}`);
    this.operator = t, this.left = e, this.right = s;
  }
  evaluate(t = {}) {
    const e = this.left.evaluate(t), s = this.right.evaluate(t);
    if (E.throwIfNotNumber(e), E.throwIfNotNumber(s), this.operator === "+")
      return Number(e) + Number(s);
    if (this.operator === "-")
      return Number(e) - Number(s);
    throw new Error("Unknown operator for PlusMinus expression");
  }
  toString() {
    return `${this.left.toString()} ${this.operator} ${this.right.toString()}`;
  }
}
r(N, "PLUS", "+"), r(N, "MINUS", "-");
class g extends p {
  constructor(t, e, s) {
    super();
    r(this, "operator");
    r(this, "left");
    r(this, "right");
    if (!["*", "/"].includes(t))
      throw new Error(`Operator not allowed in Multiply/Division expression: ${t}`);
    this.operator = t, this.left = e, this.right = s;
  }
  evaluate(t = {}) {
    const e = this.left.evaluate(t), s = this.right.evaluate(t);
    if (E.throwIfNotNumber(e), E.throwIfNotNumber(s), this.operator === "*")
      return Number(e) * Number(s);
    if (this.operator === "/")
      return Number(e) / Number(s);
    throw new Error("Unknown operator for MultDiv expression");
  }
  toString() {
    return `${this.left.toString()} ${this.operator} ${this.right.toString()}`;
  }
}
r(g, "MULT", "*"), r(g, "DIV", "/");
class I extends p {
  constructor(t, e) {
    super();
    r(this, "base");
    r(this, "exponent");
    this.base = t, this.exponent = e;
  }
  evaluate(t = {}) {
    const e = this.base.evaluate(t), s = this.exponent.evaluate(t);
    return E.throwIfNotNumber(e), E.throwIfNotNumber(s), Math.pow(Number(e), Number(s));
  }
  toString() {
    return `${this.base.toString()}^${this.exponent.toString()}`;
  }
}
class f extends p {
  constructor(t, e, s) {
    super();
    r(this, "operator");
    r(this, "left");
    r(this, "right");
    if (!["<", ">", "<=", ">=", "=", "!="].includes(t))
      throw new Error(`Operator not allowed in Logical expression: ${t}`);
    this.operator = t, this.left = e, this.right = s;
  }
  evaluate(t = {}) {
    const e = this.left.evaluate(t), s = this.right.evaluate(t);
    switch (this.operator) {
      case "<":
        return e < s ? 1 : 0;
      case ">":
        return e > s ? 1 : 0;
      case "<=":
        return e <= s ? 1 : 0;
      case ">=":
        return e >= s ? 1 : 0;
      case "=":
        return e === s ? 1 : 0;
      case "!=":
        return e !== s ? 1 : 0;
    }
    throw new Error("Unknown operator for Logical expression");
  }
  toString() {
    return `${this.left.toString()} ${this.operator} ${this.right.toString()}`;
  }
}
r(f, "LT", "<"), r(f, "GT", ">"), r(f, "LTE", "<="), r(f, "GTE", ">="), r(f, "EQ", "="), r(f, "NEQ", "!=");
class b extends p {
  constructor(t, e, s = null) {
    super();
    r(this, "fn");
    r(this, "varPath");
    r(this, "argumentExpressions");
    r(this, "formulaObject");
    r(this, "blacklisted");
    this.fn = t != null ? t : "", this.varPath = this.fn.split("."), this.argumentExpressions = e || [], this.formulaObject = s, this.blacklisted = void 0;
  }
  evaluate(t = {}) {
    var o;
    t = t || {};
    const e = this.argumentExpressions.map((c) => c.evaluate(t));
    try {
      let c = m(t, this.varPath, this.fn);
      if (c instanceof Function)
        return c.apply(this, e);
    } catch (c) {
    }
    let s;
    try {
      s = m((o = this.formulaObject) != null ? o : {}, this.varPath, this.fn);
    } catch (c) {
    }
    if (this.formulaObject && s instanceof Function) {
      if (this.isBlacklisted())
        throw new Error("Blacklisted function called: " + this.fn);
      return s.apply(this.formulaObject, e);
    }
    try {
      const c = m(Math, this.varPath, this.fn);
      if (c instanceof Function)
        return e.forEach((l) => {
          $.throwIfNotNumber(l);
        }), c.apply(this, e);
    } catch (c) {
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
class y extends p {
  constructor(t, e = null) {
    super();
    r(this, "fullPath");
    r(this, "varPath");
    r(this, "formulaObject");
    this.formulaObject = e, this.fullPath = t, this.varPath = t.split(".");
  }
  evaluate(t = {}) {
    var s;
    let e;
    try {
      e = m(t, this.varPath, this.fullPath);
    } catch (o) {
    }
    if (e === void 0 && (e = m((s = this.formulaObject) != null ? s : {}, this.varPath, this.fullPath)), typeof e == "function")
      throw new Error(`Cannot use ${this.fullPath} as value: It is a function and not allowed as a variable value.`);
    return e;
  }
  toString() {
    return `${this.varPath.join(".")}`;
  }
}
var a = /* @__PURE__ */ ((n) => (n.NUMBER = "NUMBER", n.VARIABLE = "VARIABLE", n.OPERATOR = "OPERATOR", n.LOGICAL_OPERATOR = "LOGICAL_OPERATOR", n.FUNCTION = "FUNCTION", n.LEFT_PAREN = "LEFT_PAREN", n.RIGHT_PAREN = "RIGHT_PAREN", n.COMMA = "COMMA", n.STRING = "STRING", n.EOF = "EOF", n))(a || {});
const u = class u {
  constructor() {
    r(this, "input");
    r(this, "position");
    this.input = "", this.position = 0;
  }
  tokenize(i) {
    this.input = i, this.position = 0;
    const t = [];
    for (; this.position < this.input.length && (this.skipWhitespace(), !(this.position >= this.input.length)); ) {
      const e = this.nextToken(t);
      e && t.push(e);
    }
    return t.push({
      type: "EOF",
      value: "",
      raw: "",
      position: this.position,
      length: 0
    }), t;
  }
  nextToken(i) {
    return this.readString() || this.readLogicalOperator() || this.readNumber(i) || this.readOperator() || this.readParenthesis() || this.readComma() || this.readIdentifier() || this.throwUnexpectedChar();
  }
  skipWhitespace() {
    const t = this.input.slice(this.position).match(u.PATTERNS.WHITESPACE);
    t && (this.position += t[0].length);
  }
  remaining() {
    return this.input.slice(this.position);
  }
  /**
   * Read a number token. Includes the minus sign if it's unambiguously part of the number.
   * Handles negative numbers when preceded by operators, commas, left parenthesis, or at start.
   */
  readNumber(i) {
    const t = this.position, s = this.remaining().match(u.PATTERNS.NUMBER);
    if (!s)
      return null;
    const o = s[0];
    if (o.startsWith("-")) {
      const l = i.length > 0 ? i[i.length - 1] : null;
      if (!(!l || l.type === "OPERATOR" || l.type === "LOGICAL_OPERATOR" || l.type === "COMMA" || l.type === "LEFT_PAREN"))
        return null;
    }
    return this.position += o.length, {
      type: "NUMBER",
      value: parseFloat(o),
      raw: o,
      position: t,
      length: o.length
    };
  }
  /**
   * Read an identifier (variable or function name).
   * Supports: myVar, x, PI, my_var, obj.prop, [myVar], [obj.prop]
   */
  readIdentifier() {
    const i = this.position, t = this.remaining();
    let e = t.match(u.PATTERNS.BRACKETED_IDENTIFIER);
    if (e) {
      const s = e[0], o = e[1];
      if (o === "")
        throw new Error(`Empty bracketed variable at position ${i}`);
      if (!/^[a-zA-Z0-9_.]+$/.test(o)) {
        const d = o.match(/[^a-zA-Z0-9_.]/), O = d ? d[0] : o[0], S = i + 1 + o.indexOf(O);
        throw new Error(
          `Invalid character '${O}' in bracketed variable at position ${S}`
        );
      }
      this.position += s.length;
      const c = this.position;
      this.skipWhitespace();
      const l = this.position < this.input.length && this.input[this.position] === "(";
      return this.position = c, {
        type: l ? "FUNCTION" : "VARIABLE",
        value: o,
        raw: s,
        position: i,
        length: s.length
      };
    }
    if (e = t.match(u.PATTERNS.IDENTIFIER), e) {
      const s = e[0], o = s;
      this.position += s.length;
      const c = this.position;
      this.skipWhitespace();
      const l = this.position < this.input.length && this.input[this.position] === "(";
      return this.position = c, {
        type: l ? "FUNCTION" : "VARIABLE",
        value: o,
        raw: s,
        position: i,
        length: s.length
      };
    }
    return null;
  }
  /**
   * Read a string literal (single or double quoted).
   * Supports escaped quotes: \" or \'
   */
  readString() {
    const i = this.position, t = this.remaining();
    let e = t.match(u.PATTERNS.STRING_DOUBLE);
    if (e) {
      const s = e[0], c = e[1].replace(/\\(.)/g, "$1");
      return this.position += s.length, {
        type: "STRING",
        value: c,
        raw: s,
        position: i,
        length: s.length
      };
    }
    if (e = t.match(u.PATTERNS.STRING_SINGLE), e) {
      const s = e[0], c = e[1].replace(/\\(.)/g, "$1");
      return this.position += s.length, {
        type: "STRING",
        value: c,
        raw: s,
        position: i,
        length: s.length
      };
    }
    if (t.startsWith('"') || t.startsWith("'"))
      throw new Error(`Unterminated string at position ${i}`);
    return null;
  }
  /**
   * Read a simple operator: +, -, *, /, ^
   */
  readOperator() {
    const i = this.position, e = this.remaining().match(u.PATTERNS.OPERATOR);
    if (!e)
      return null;
    const s = e[0];
    return this.position += s.length, {
      type: "OPERATOR",
      value: s,
      raw: s,
      position: i,
      length: s.length
    };
  }
  /**
   * Read a logical operator: <, >, <=, >=, =, !=
   */
  readLogicalOperator() {
    const i = this.position, t = this.remaining();
    if (t.startsWith("!") && !t.startsWith("!="))
      throw new Error(`Invalid operator '!' at position ${i}. Did you mean '!='?`);
    const e = t.match(u.PATTERNS.LOGICAL_OPERATOR);
    if (!e)
      return null;
    const s = e[0];
    return this.position += s.length, {
      type: "LOGICAL_OPERATOR",
      value: s,
      raw: s,
      position: i,
      length: s.length
    };
  }
  /**
   * Read parentheses
   */
  readParenthesis() {
    const i = this.position, t = this.remaining();
    let e = t.match(u.PATTERNS.LEFT_PAREN);
    if (e) {
      const s = e[0];
      return this.position += s.length, {
        type: "LEFT_PAREN",
        value: s,
        raw: s,
        position: i,
        length: s.length
      };
    }
    if (e = t.match(u.PATTERNS.RIGHT_PAREN), e) {
      const s = e[0];
      return this.position += s.length, {
        type: "RIGHT_PAREN",
        value: s,
        raw: s,
        position: i,
        length: s.length
      };
    }
    return null;
  }
  /**
   * Read comma separator
   */
  readComma() {
    const i = this.position, e = this.remaining().match(u.PATTERNS.COMMA);
    if (!e)
      return null;
    const s = e[0];
    return this.position += s.length, {
      type: "COMMA",
      value: s,
      raw: s,
      position: i,
      length: s.length
    };
  }
  /**
   * Throw an error for unexpected characters
   */
  throwUnexpectedChar() {
    const i = this.input[this.position] || "EOF";
    throw new Error(`Unexpected character '${i}' at position ${this.position}`);
  }
};
// Regex patterns for token matching
r(u, "PATTERNS", {
  WHITESPACE: /^\s+/,
  NUMBER: /^-?\d+(\.\d+)?/,
  IDENTIFIER: /^[a-zA-Z_][a-zA-Z0-9_.]*/,
  BRACKETED_IDENTIFIER: /^\[([^\]]*)\]/,
  // Match anything between brackets, validate later
  STRING_DOUBLE: /^"((?:[^"\\]|\\.)*)"/,
  STRING_SINGLE: /^'((?:[^'\\]|\\.)*)'/,
  LOGICAL_OPERATOR: /^(<=|>=|!=|<|>|=)/,
  OPERATOR: /^[+\-*/^]/,
  LEFT_PAREN: /^\(/,
  RIGHT_PAREN: /^\)/,
  COMMA: /^,/
});
let R = u;
const P = {
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
class T {
  constructor(i, t) {
    r(this, "tokens");
    r(this, "current");
    r(this, "formulaObject");
    this.tokens = i, this.current = 0, this.formulaObject = t;
  }
  /**
   * Main entry point: Parse the token stream into an Expression tree
   */
  parse() {
    const i = this.parseExpression(0);
    if (!this.isAtEnd()) {
      const t = this.peek();
      throw new Error(
        `Unexpected token '${t.value}' at position ${t.position}: Expected end of expression`
      );
    }
    return i;
  }
  /**
   * Pratt parsing: handles operator precedence elegantly
   * @param minPrecedence Minimum precedence level to parse
   */
  parseExpression(i) {
    let t = this.parsePrimary();
    for (; !this.isAtEnd(); ) {
      const e = this.peek();
      if (e.type !== a.OPERATOR && e.type !== a.LOGICAL_OPERATOR)
        break;
      const s = this.getPrecedence(e);
      if (s < i)
        break;
      const c = e.value === "^" ? s : s + 1;
      this.consume();
      const l = this.parseExpression(c);
      t = p.createOperatorExpression(
        e,
        t,
        l
      );
    }
    return t;
  }
  /**
   * Parse primary expressions: numbers, variables, functions, parentheses, unary operators
   */
  parsePrimary() {
    const i = this.peek();
    if (this.match(a.OPERATOR) && i.value === "-") {
      this.consume();
      const t = this.parsePrimary();
      return new g("*", new w(-1), t);
    }
    if (this.match(a.OPERATOR) && i.value === "+")
      return this.consume(), this.parsePrimary();
    if (this.match(a.NUMBER))
      return this.consume(), new w(i.value);
    if (this.match(a.STRING))
      return this.consume(), new w(i.value, "string");
    if (this.match(a.LEFT_PAREN))
      return this.parseParenthesizedExpression();
    if (this.match(a.VARIABLE, a.FUNCTION))
      return this.parseVariableOrFunction();
    throw new Error(
      `Unexpected token '${i.value}' at position ${i.position}: Expected number, variable, function, or '('`
    );
  }
  /**
   * Parse a parenthesized expression: (expr)
   */
  parseParenthesizedExpression() {
    const i = this.consume(a.LEFT_PAREN), t = this.parseExpression(0);
    if (!this.match(a.RIGHT_PAREN)) {
      const e = this.peek();
      throw new Error(
        `Missing closing parenthesis at position ${e.position}: Expected ')' to match '(' at position ${i.position}`
      );
    }
    return this.consume(a.RIGHT_PAREN), new x(t);
  }
  /**
   * Parse a variable or function call
   */
  parseVariableOrFunction() {
    const i = this.consume(), t = i.value;
    return this.match(a.LEFT_PAREN) ? this.parseFunctionCall(t, i.position) : (this.formulaObject.registerVariable(t), new y(t, this.formulaObject));
  }
  /**
   * Parse a function call: functionName(arg1, arg2, ...)
   */
  parseFunctionCall(i, t) {
    const e = this.consume(a.LEFT_PAREN), s = [];
    if (!this.match(a.RIGHT_PAREN))
      do
        s.push(this.parseExpression(0));
      while (this.matchAndConsume(a.COMMA));
    if (!this.match(a.RIGHT_PAREN)) {
      const o = this.peek();
      throw new Error(
        `Missing closing parenthesis for function '${i}' at position ${o.position}: Expected ')' to match '(' at position ${e.position}`
      );
    }
    return this.consume(a.RIGHT_PAREN), new b(i, s, this.formulaObject);
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
  consume(i) {
    const t = this.peek();
    if (i && t.type !== i)
      throw new Error(
        `Expected ${i} at position ${t.position}, got ${t.type} ('${t.value}')`
      );
    return this.current++, t;
  }
  /**
   * Check if the current token matches any of the given types
   */
  match(...i) {
    return i.includes(this.peek().type);
  }
  /**
   * If the current token matches the given type, consume it and return true
   */
  matchAndConsume(i) {
    return this.match(i) ? (this.consume(), !0) : !1;
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
  getPrecedence(i) {
    var t, e;
    if (i.type === a.LOGICAL_OPERATOR) {
      const s = i.value;
      return (t = P[s]) != null ? t : 0;
    }
    if (i.type === a.OPERATOR) {
      const s = i.value;
      return (e = P[s]) != null ? e : 0;
    }
    return 0;
  }
}
const A = {
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
  constructor(i, t = {}) {
    r(this, "formulaExpression");
    r(this, "options");
    r(this, "formulaStr");
    r(this, "_variables");
    r(this, "_memory");
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
  parse(i) {
    const e = new R().tokenize(i);
    return new T(e, this).parse();
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
      return i.map((e) => this.evaluate(e));
    let t = this.getExpression();
    if (!(t instanceof p))
      throw new Error("No expression set: Did you init the object with a Formula?");
    if (this.options.memoization) {
      let e = this.resultFromMemory(i);
      return e !== null || (e = t.evaluate({ ...A, ...i }), this.storeInMemory(i, e)), e;
    }
    return t.evaluate({ ...A, ...i });
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
  ifElse(i, t, e) {
    return i ? t : e;
  }
  first(...i) {
    for (const t of i)
      if (t instanceof Array) {
        let e = this.first(...t);
        if (e)
          return e;
      } else if (t)
        return t;
    if (i.length > 0) {
      const t = i[i.length - 1];
      return t instanceof Array ? this.first(...t) : t;
    }
    throw new Error("first(): At least one argument is required");
  }
};
r(h, "Expression", p), r(h, "BracketExpression", x), r(h, "PowerExpression", I), r(h, "MultDivExpression", g), r(h, "PlusMinusExpression", N), r(h, "LogicalExpression", f), r(h, "ValueExpression", w), r(h, "VariableExpression", y), r(h, "FunctionExpression", b), r(h, "MATH_CONSTANTS", A), r(h, "ALLOWED_FUNCTIONS", ["ifElse", "first"]), r(h, "Tokenizer", R), r(h, "TokenType", a), r(h, "Parser", T), // export { Tokenizer, TokenType } from './tokenizer';
// export type { Token } from './tokenizer';
// export { Parser } from './parser';
// Create a function blacklist:
r(h, "functionBlacklist", Object.getOwnPropertyNames(h.prototype).filter((i) => h.prototype[i] instanceof Function && !h.ALLOWED_FUNCTIONS.includes(i)).map((i) => h.prototype[i]));
let v = h;
export {
  v as default
};
//# sourceMappingURL=fparser.js.map
