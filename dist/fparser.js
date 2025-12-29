var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
function getProperty(object, path, fullPath) {
  let curr = object;
  let prev = null;
  for (let propName of path) {
    if (!["object", "string"].includes(typeof curr)) {
      throw new Error(`Cannot evaluate ${propName}, property not found (from path ${fullPath})`);
    }
    if (typeof curr === "object" && !(propName in curr)) {
      throw new Error(`Cannot evaluate ${propName}, property not found (from path ${fullPath})`);
    }
    if (typeof curr === "string" && !curr.hasOwnProperty(propName)) {
      throw new Error(`Cannot evaluate ${propName}, property not found (from path ${fullPath})`);
    }
    prev = curr;
    curr = curr[propName];
  }
  if (typeof curr === "object" && !(curr instanceof Array)) {
    throw new Error("Invalid value");
  }
  if (typeof curr === "function" && prev) {
    curr = curr.bind(prev);
  }
  return curr;
}
class MathFunctionHelper {
  static throwIfNotNumber(value) {
    const valueType = typeof value;
    if (valueType === "string") {
      throw new Error("Strings are not allowed in math operations");
    }
  }
}
class MathOperatorHelper {
  static throwIfNotNumber(value) {
    const valueType = typeof value;
    if (valueType === "string") {
      throw new Error("Strings are not allowed in math operations");
    }
  }
}
class Expression {
  /**
   * Creates an operator expression from a token.
   * @param operatorToken The operator token (or string for backward compatibility)
   * @param left Left operand expression
   * @param right Right operand expression
   */
  static createOperatorExpression(operatorToken, left, right) {
    const operator = typeof operatorToken === "string" ? operatorToken : String(operatorToken.value);
    if (operator === "^") {
      return new PowerExpression(left, right);
    }
    if (["*", "/"].includes(operator)) {
      return new MultDivExpression(operator, left, right);
    }
    if (["+", "-"].includes(operator)) {
      return new PlusMinusExpression(operator, left, right);
    }
    if (["<", ">", "<=", ">=", "=", "!="].includes(operator)) {
      return new LogicalExpression(operator, left, right);
    }
    throw new Error(`Unknown operator: ${operator}`);
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
  constructor(value, type = "number") {
    super();
    __publicField(this, "value");
    __publicField(this, "type");
    this.value = Number(value);
    switch (type) {
      case "number":
        this.value = Number(value);
        if (isNaN(this.value)) {
          throw new Error("Cannot parse number: " + value);
        }
        break;
      case "string":
        this.value = String(value);
        break;
      default:
        throw new Error("Invalid value type: " + type);
    }
    this.type = type;
  }
  evaluate() {
    return this.value;
  }
  toString() {
    switch (this.type) {
      case "number":
        return String(this.value);
      case "string":
        return String('"' + this.value + '"');
      default:
        throw new Error("Invalid type");
    }
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
    const leftValue = this.left.evaluate(params);
    const rightValue = this.right.evaluate(params);
    MathOperatorHelper.throwIfNotNumber(leftValue);
    MathOperatorHelper.throwIfNotNumber(rightValue);
    if (this.operator === "+") {
      return Number(leftValue) + Number(rightValue);
    }
    if (this.operator === "-") {
      return Number(leftValue) - Number(rightValue);
    }
    throw new Error("Unknown operator for PlusMinus expression");
  }
  toString() {
    return `${this.left.toString()} ${this.operator} ${this.right.toString()}`;
  }
}
__publicField(PlusMinusExpression, "PLUS", "+");
__publicField(PlusMinusExpression, "MINUS", "-");
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
    const leftValue = this.left.evaluate(params);
    const rightValue = this.right.evaluate(params);
    MathOperatorHelper.throwIfNotNumber(leftValue);
    MathOperatorHelper.throwIfNotNumber(rightValue);
    if (this.operator === "*") {
      return Number(leftValue) * Number(rightValue);
    }
    if (this.operator === "/") {
      return Number(leftValue) / Number(rightValue);
    }
    throw new Error("Unknown operator for MultDiv expression");
  }
  toString() {
    return `${this.left.toString()} ${this.operator} ${this.right.toString()}`;
  }
}
__publicField(MultDivExpression, "MULT", "*");
__publicField(MultDivExpression, "DIV", "/");
class PowerExpression extends Expression {
  constructor(base, exponent) {
    super();
    __publicField(this, "base");
    __publicField(this, "exponent");
    this.base = base;
    this.exponent = exponent;
  }
  evaluate(params = {}) {
    const baseValue = this.base.evaluate(params);
    const exponentValue = this.exponent.evaluate(params);
    MathOperatorHelper.throwIfNotNumber(baseValue);
    MathOperatorHelper.throwIfNotNumber(exponentValue);
    return Math.pow(Number(baseValue), Number(exponentValue));
  }
  toString() {
    return `${this.base.toString()}^${this.exponent.toString()}`;
  }
}
class LogicalExpression extends Expression {
  constructor(operator, left, right) {
    super();
    __publicField(this, "operator");
    __publicField(this, "left");
    __publicField(this, "right");
    if (!["<", ">", "<=", ">=", "=", "!="].includes(operator)) {
      throw new Error(`Operator not allowed in Logical expression: ${operator}`);
    }
    this.operator = operator;
    this.left = left;
    this.right = right;
  }
  evaluate(params = {}) {
    const leftValue = this.left.evaluate(params);
    const rightValue = this.right.evaluate(params);
    switch (this.operator) {
      case "<":
        return leftValue < rightValue ? 1 : 0;
      case ">":
        return leftValue > rightValue ? 1 : 0;
      case "<=":
        return leftValue <= rightValue ? 1 : 0;
      case ">=":
        return leftValue >= rightValue ? 1 : 0;
      case "=":
        return leftValue === rightValue ? 1 : 0;
      case "!=":
        return leftValue !== rightValue ? 1 : 0;
    }
    throw new Error("Unknown operator for Logical expression");
  }
  toString() {
    return `${this.left.toString()} ${this.operator} ${this.right.toString()}`;
  }
}
__publicField(LogicalExpression, "LT", "<");
__publicField(LogicalExpression, "GT", ">");
__publicField(LogicalExpression, "LTE", "<=");
__publicField(LogicalExpression, "GTE", ">=");
__publicField(LogicalExpression, "EQ", "=");
__publicField(LogicalExpression, "NEQ", "!=");
class FunctionExpression extends Expression {
  constructor(fn, argumentExpressions, formulaObject = null) {
    super();
    __publicField(this, "fn");
    __publicField(this, "varPath");
    __publicField(this, "argumentExpressions");
    __publicField(this, "formulaObject");
    __publicField(this, "blacklisted");
    this.fn = fn ?? "";
    this.varPath = this.fn.split(".");
    this.argumentExpressions = argumentExpressions || [];
    this.formulaObject = formulaObject;
    this.blacklisted = void 0;
  }
  evaluate(params = {}) {
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
      objFn = getProperty(this.formulaObject ?? {}, this.varPath, this.fn);
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
        paramValues.forEach((paramValue) => {
          MathFunctionHelper.throwIfNotNumber(paramValue);
        });
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
    let value = void 0;
    try {
      value = getProperty(params, this.varPath, this.fullPath);
    } catch (e) {
    }
    if (value === void 0) {
      value = getProperty(this.formulaObject ?? {}, this.varPath, this.fullPath);
    }
    if (typeof value === "function" || typeof value === "object") {
      throw new Error(`Cannot use ${this.fullPath} as value: It contains a non-numerical value.`);
    }
    return value;
  }
  toString() {
    return `${this.varPath.join(".")}`;
  }
}
var TokenType = /* @__PURE__ */ ((TokenType2) => {
  TokenType2["NUMBER"] = "NUMBER";
  TokenType2["VARIABLE"] = "VARIABLE";
  TokenType2["OPERATOR"] = "OPERATOR";
  TokenType2["LOGICAL_OPERATOR"] = "LOGICAL_OPERATOR";
  TokenType2["FUNCTION"] = "FUNCTION";
  TokenType2["LEFT_PAREN"] = "LEFT_PAREN";
  TokenType2["RIGHT_PAREN"] = "RIGHT_PAREN";
  TokenType2["COMMA"] = "COMMA";
  TokenType2["STRING"] = "STRING";
  TokenType2["EOF"] = "EOF";
  return TokenType2;
})(TokenType || {});
class Tokenizer {
  constructor() {
    __publicField(this, "input");
    __publicField(this, "position");
    this.input = "";
    this.position = 0;
  }
  tokenize(input) {
    this.input = input;
    this.position = 0;
    const tokens = [];
    while (this.position < this.input.length) {
      this.skipWhitespace();
      if (this.position >= this.input.length)
        break;
      const token = this.nextToken(tokens);
      if (token) {
        tokens.push(token);
      }
    }
    tokens.push({
      type: "EOF",
      value: "",
      raw: "",
      position: this.position,
      length: 0
    });
    return tokens;
  }
  nextToken(tokens) {
    return this.readString() || this.readLogicalOperator() || this.readNumber(tokens) || this.readOperator() || this.readParenthesis() || this.readComma() || this.readIdentifier() || this.throwUnexpectedChar();
  }
  skipWhitespace() {
    while (this.position < this.input.length && /\s/.test(this.input[this.position])) {
      this.position++;
    }
  }
  peek(offset = 0) {
    return this.input[this.position + offset] || "";
  }
  /**
   * Read a number token. Includes the minus sign if it's unambiguously part of the number.
   * Handles negative numbers when preceded by operators, commas, left parenthesis, or at start.
   */
  readNumber(tokens) {
    const start = this.position;
    let raw = "";
    if (this.peek() === "-") {
      const prevToken = tokens.length > 0 ? tokens[tokens.length - 1] : null;
      const canBeNegative = !prevToken || prevToken.type === "OPERATOR" || prevToken.type === "LOGICAL_OPERATOR" || prevToken.type === "COMMA" || prevToken.type === "LEFT_PAREN";
      if (canBeNegative && /\d/.test(this.peek(1))) {
        raw += this.peek();
        this.position++;
      } else {
        return null;
      }
    }
    if (!/\d/.test(this.peek())) {
      if (raw === "-") {
        this.position = start;
        return null;
      }
      return null;
    }
    while (/\d/.test(this.peek())) {
      raw += this.peek();
      this.position++;
    }
    if (this.peek() === ".") {
      raw += this.peek();
      this.position++;
      while (/\d/.test(this.peek())) {
        raw += this.peek();
        this.position++;
      }
    }
    const value = parseFloat(raw);
    return {
      type: "NUMBER",
      value,
      raw,
      position: start,
      length: this.position - start
    };
  }
  /**
   * Read an identifier (variable or function name).
   * Supports: myVar, x, PI, my_var, obj.prop, [myVar], [obj.prop]
   */
  readIdentifier() {
    const start = this.position;
    let raw = "";
    let value = "";
    let isBracketed = false;
    if (this.peek() === "[") {
      isBracketed = true;
      raw += this.peek();
      this.position++;
      while (this.position < this.input.length && this.peek() !== "]") {
        if (!/[a-zA-Z0-9_.]/.test(this.peek())) {
          throw new Error(
            `Invalid character '${this.peek()}' in bracketed variable at position ${this.position}`
          );
        }
        value += this.peek();
        raw += this.peek();
        this.position++;
      }
      if (this.peek() !== "]") {
        throw new Error(`Unclosed bracket for variable at position ${start}`);
      }
      raw += this.peek();
      this.position++;
    } else {
      if (!/[a-zA-Z_]/.test(this.peek())) {
        return null;
      }
      while (/[a-zA-Z0-9_.]/.test(this.peek())) {
        value += this.peek();
        raw += this.peek();
        this.position++;
      }
    }
    if (value === "") {
      if (isBracketed) {
        throw new Error(`Empty bracketed variable at position ${start}`);
      }
      return null;
    }
    let savedPos = this.position;
    this.skipWhitespace();
    const isFunction = this.peek() === "(";
    this.position = savedPos;
    return {
      type: isFunction ? "FUNCTION" : "VARIABLE",
      value,
      raw,
      position: start,
      length: this.position - start
    };
  }
  /**
   * Read a string literal (single or double quoted).
   * Supports escaped quotes: \" or \'
   */
  readString() {
    const start = this.position;
    const quote = this.peek();
    if (quote !== '"' && quote !== "'") {
      return null;
    }
    let raw = quote;
    let value = "";
    this.position++;
    while (this.position < this.input.length) {
      const char = this.peek();
      if (char === "\\" && (this.peek(1) === quote || this.peek(1) === "\\")) {
        const escapedChar = this.peek(1);
        raw += char + escapedChar;
        value += escapedChar;
        this.position += 2;
      } else if (char === quote) {
        raw += char;
        this.position++;
        break;
      } else {
        raw += char;
        value += char;
        this.position++;
      }
    }
    if (!raw.endsWith(quote)) {
      throw new Error(`Unterminated string at position ${start}`);
    }
    return {
      type: "STRING",
      value,
      raw,
      position: start,
      length: this.position - start
    };
  }
  /**
   * Read a simple operator: +, -, *, /, ^
   */
  readOperator() {
    const char = this.peek();
    const operatorPattern = /[+\-*/^]/;
    if (!operatorPattern.test(char)) {
      return null;
    }
    const start = this.position;
    this.position++;
    return {
      type: "OPERATOR",
      value: char,
      raw: char,
      position: start,
      length: 1
    };
  }
  /**
   * Read a logical operator: <, >, <=, >=, =, !=
   */
  readLogicalOperator() {
    const start = this.position;
    const char = this.peek();
    const nextChar = this.peek(1);
    if (char === "<" && nextChar === "=" || char === ">" && nextChar === "=" || char === "!" && nextChar === "=") {
      const raw = char + nextChar;
      this.position += 2;
      return {
        type: "LOGICAL_OPERATOR",
        value: raw,
        raw,
        position: start,
        length: 2
      };
    }
    if (char === "<" || char === ">" || char === "=") {
      this.position++;
      return {
        type: "LOGICAL_OPERATOR",
        value: char,
        raw: char,
        position: start,
        length: 1
      };
    }
    if (char === "!") {
      throw new Error(`Invalid operator '!' at position ${start}. Did you mean '!='?`);
    }
    return null;
  }
  /**
   * Read parentheses
   */
  readParenthesis() {
    const char = this.peek();
    const start = this.position;
    if (char === "(") {
      this.position++;
      return {
        type: "LEFT_PAREN",
        value: "(",
        raw: "(",
        position: start,
        length: 1
      };
    }
    if (char === ")") {
      this.position++;
      return {
        type: "RIGHT_PAREN",
        value: ")",
        raw: ")",
        position: start,
        length: 1
      };
    }
    return null;
  }
  /**
   * Read comma separator
   */
  readComma() {
    const char = this.peek();
    const start = this.position;
    if (char === ",") {
      this.position++;
      return {
        type: "COMMA",
        value: ",",
        raw: ",",
        position: start,
        length: 1
      };
    }
    return null;
  }
  /**
   * Throw an error for unexpected characters
   */
  throwUnexpectedChar() {
    const char = this.peek();
    throw new Error(`Unexpected character '${char}' at position ${this.position}`);
  }
}
const PRECEDENCE = {
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
class Parser {
  constructor(tokens, formulaObject) {
    __publicField(this, "tokens");
    __publicField(this, "current");
    __publicField(this, "formulaObject");
    this.tokens = tokens;
    this.current = 0;
    this.formulaObject = formulaObject;
  }
  /**
   * Main entry point: Parse the token stream into an Expression tree
   */
  parse() {
    const expr = this.parseExpression(0);
    if (!this.isAtEnd()) {
      const token = this.peek();
      throw new Error(
        `Unexpected token '${token.value}' at position ${token.position}: Expected end of expression`
      );
    }
    return expr;
  }
  /**
   * Pratt parsing: handles operator precedence elegantly
   * @param minPrecedence Minimum precedence level to parse
   */
  parseExpression(minPrecedence) {
    let left = this.parsePrimary();
    while (!this.isAtEnd()) {
      const token = this.peek();
      if (token.type !== TokenType.OPERATOR && token.type !== TokenType.LOGICAL_OPERATOR) {
        break;
      }
      const precedence = this.getPrecedence(token);
      if (precedence < minPrecedence)
        break;
      const isRightAssociative = token.value === "^";
      const nextPrecedence = isRightAssociative ? precedence : precedence + 1;
      this.consume();
      const right = this.parseExpression(nextPrecedence);
      left = Expression.createOperatorExpression(
        token,
        left,
        right
      );
    }
    return left;
  }
  /**
   * Parse primary expressions: numbers, variables, functions, parentheses, unary operators
   */
  parsePrimary() {
    const token = this.peek();
    if (this.match(TokenType.OPERATOR) && token.value === "-") {
      this.consume();
      const expr = this.parsePrimary();
      return new MultDivExpression("*", new ValueExpression(-1), expr);
    }
    if (this.match(TokenType.OPERATOR) && token.value === "+") {
      this.consume();
      return this.parsePrimary();
    }
    if (this.match(TokenType.NUMBER)) {
      this.consume();
      return new ValueExpression(token.value);
    }
    if (this.match(TokenType.STRING)) {
      this.consume();
      return new ValueExpression(token.value, "string");
    }
    if (this.match(TokenType.LEFT_PAREN)) {
      return this.parseParenthesizedExpression();
    }
    if (this.match(TokenType.VARIABLE, TokenType.FUNCTION)) {
      return this.parseVariableOrFunction();
    }
    throw new Error(
      `Unexpected token '${token.value}' at position ${token.position}: Expected number, variable, function, or '('`
    );
  }
  /**
   * Parse a parenthesized expression: (expr)
   */
  parseParenthesizedExpression() {
    const leftParen = this.consume(TokenType.LEFT_PAREN);
    const expr = this.parseExpression(0);
    if (!this.match(TokenType.RIGHT_PAREN)) {
      const token = this.peek();
      throw new Error(
        `Missing closing parenthesis at position ${token.position}: Expected ')' to match '(' at position ${leftParen.position}`
      );
    }
    this.consume(TokenType.RIGHT_PAREN);
    return new BracketExpression(expr);
  }
  /**
   * Parse a variable or function call
   */
  parseVariableOrFunction() {
    const token = this.consume();
    const name = token.value;
    if (this.match(TokenType.LEFT_PAREN)) {
      return this.parseFunctionCall(name, token.position);
    }
    this.formulaObject.registerVariable(name);
    return new VariableExpression(name, this.formulaObject);
  }
  /**
   * Parse a function call: functionName(arg1, arg2, ...)
   */
  parseFunctionCall(name, namePosition) {
    const leftParen = this.consume(TokenType.LEFT_PAREN);
    const args = [];
    if (!this.match(TokenType.RIGHT_PAREN)) {
      do {
        args.push(this.parseExpression(0));
      } while (this.matchAndConsume(TokenType.COMMA));
    }
    if (!this.match(TokenType.RIGHT_PAREN)) {
      const token = this.peek();
      throw new Error(
        `Missing closing parenthesis for function '${name}' at position ${token.position}: Expected ')' to match '(' at position ${leftParen.position}`
      );
    }
    this.consume(TokenType.RIGHT_PAREN);
    return new FunctionExpression(name, args, this.formulaObject);
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
  consume(expected) {
    const token = this.peek();
    if (expected && token.type !== expected) {
      throw new Error(
        `Expected ${expected} at position ${token.position}, got ${token.type} ('${token.value}')`
      );
    }
    this.current++;
    return token;
  }
  /**
   * Check if the current token matches any of the given types
   */
  match(...types) {
    return types.includes(this.peek().type);
  }
  /**
   * If the current token matches the given type, consume it and return true
   */
  matchAndConsume(type) {
    if (this.match(type)) {
      this.consume();
      return true;
    }
    return false;
  }
  /**
   * Check if we've reached the end of the token stream
   */
  isAtEnd() {
    return this.peek().type === TokenType.EOF;
  }
  /**
   * Get the precedence level for a token
   */
  getPrecedence(token) {
    if (token.type === TokenType.LOGICAL_OPERATOR) {
      const op = token.value;
      return PRECEDENCE[op] ?? 0;
    }
    if (token.type === TokenType.OPERATOR) {
      const op = token.value;
      return PRECEDENCE[op] ?? 0;
    }
    return 0;
  }
}
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
  parse(str) {
    const tokenizer = new Tokenizer();
    const tokens = tokenizer.tokenize(str);
    const parser = new Parser(tokens, this);
    return parser.parse();
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
   * @return {Number|String|(Number|String)[]} The evaluated result, or an array with results
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
    valueObj = valueObj ?? {};
    return new _Formula(formula, options).evaluate(valueObj);
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
  ifElse(predicate, trueValue, falseValue) {
    if (predicate) {
      return trueValue;
    } else {
      return falseValue;
    }
  }
  first(...args) {
    for (const arg of args) {
      if (arg instanceof Array) {
        let res = this.first(...arg);
        if (res) {
          return res;
        }
      } else {
        if (arg) {
          return arg;
        }
      }
    }
    if (args.length > 0) {
      const last = args[args.length - 1];
      if (last instanceof Array) {
        return this.first(...last);
      } else {
        return last;
      }
    }
    throw new Error("first(): At least one argument is required");
  }
};
__publicField(_Formula, "Expression", Expression);
__publicField(_Formula, "BracketExpression", BracketExpression);
__publicField(_Formula, "PowerExpression", PowerExpression);
__publicField(_Formula, "MultDivExpression", MultDivExpression);
__publicField(_Formula, "PlusMinusExpression", PlusMinusExpression);
__publicField(_Formula, "LogicalExpression", LogicalExpression);
__publicField(_Formula, "ValueExpression", ValueExpression);
__publicField(_Formula, "VariableExpression", VariableExpression);
__publicField(_Formula, "FunctionExpression", FunctionExpression);
__publicField(_Formula, "MATH_CONSTANTS", MATH_CONSTANTS);
__publicField(_Formula, "ALLOWED_FUNCTIONS", ["ifElse", "first"]);
// Create a function blacklist:
__publicField(_Formula, "functionBlacklist", Object.getOwnPropertyNames(_Formula.prototype).filter((prop) => _Formula.prototype[prop] instanceof Function && !_Formula.ALLOWED_FUNCTIONS.includes(prop)).map((prop) => _Formula.prototype[prop]));
let Formula = _Formula;
export {
  Parser,
  TokenType,
  Tokenizer,
  Formula as default
};
//# sourceMappingURL=fparser.js.map
