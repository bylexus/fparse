declare global {
    interface Math {
        [key: string]: number | Function;
    }
}
type FormulaOptions = {
    memoization?: boolean;
};
type ValueObject = {
    [key: string]: number | string | Function | ValueObject;
};
declare class Expression {
    static createOperatorExpression(operator: string, left: Expression, right: Expression): PowerExpression | MultDivExpression | PlusMinusExpression | LogicalExpression;
    evaluate(params?: ValueObject): number | string;
    toString(): string;
}
declare class BracketExpression extends Expression {
    innerExpression: Expression;
    constructor(expr: Expression);
    evaluate(params?: {}): number | string;
    toString(): string;
}
declare class ValueExpression extends Expression {
    value: number | string;
    type: string;
    constructor(value: number | string, type?: string);
    evaluate(): number | string;
    toString(): string;
}
declare class PlusMinusExpression extends Expression {
    operator: string;
    left: Expression;
    right: Expression;
    constructor(operator: string, left: Expression, right: Expression);
    evaluate(params?: ValueObject): number;
    toString(): string;
}
declare class MultDivExpression extends Expression {
    operator: string;
    left: Expression;
    right: Expression;
    constructor(operator: string, left: Expression, right: Expression);
    evaluate(params?: ValueObject): number;
    toString(): string;
}
declare class PowerExpression extends Expression {
    base: Expression;
    exponent: Expression;
    constructor(base: Expression, exponent: Expression);
    evaluate(params?: ValueObject): number;
    toString(): string;
}
declare class LogicalExpression extends Expression {
    operator: string;
    left: Expression;
    right: Expression;
    constructor(operator: string, left: Expression, right: Expression);
    evaluate(params?: ValueObject): number;
    toString(): string;
}
declare class FunctionExpression extends Expression {
    fn: string;
    varPath: string[];
    argumentExpressions: Expression[];
    formulaObject: Formula | null;
    blacklisted: boolean | undefined;
    constructor(fn: string | null, argumentExpressions: Expression[], formulaObject?: Formula | null);
    evaluate(params?: ValueObject): number | string;
    toString(): string;
    isBlacklisted(): boolean;
}
declare class VariableExpression extends Expression {
    fullPath: string;
    varPath: string[];
    formulaObject: Formula | null;
    constructor(fullPath: string, formulaObj?: Formula | null);
    evaluate(params?: {}): number | string;
    toString(): string;
}
export default class Formula {
    [key: string]: any;
    static Expression: typeof Expression;
    static BracketExpression: typeof BracketExpression;
    static PowerExpression: typeof PowerExpression;
    static MultDivExpression: typeof MultDivExpression;
    static PlusMinusExpression: typeof PlusMinusExpression;
    static LogicalExpression: typeof LogicalExpression;
    static ValueExpression: typeof ValueExpression;
    static VariableExpression: typeof VariableExpression;
    static FunctionExpression: typeof FunctionExpression;
    static MATH_CONSTANTS: {
        PI: number;
        E: number;
        LN2: number;
        LN10: number;
        LOG2E: number;
        LOG10E: number;
        SQRT1_2: number;
        SQRT2: number;
    };
    static functionBlacklist: any[];
    formulaExpression: Expression | null;
    options: FormulaOptions;
    formulaStr: string;
    private _variables;
    private _memory;
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
    constructor(fStr: string, options?: FormulaOptions | null);
    /**
     * Re-sets the given String and parses it to a formula expression. Can be used after initialization,
     * to re-use the Formula object.
     *
     * @param {String} formulaString The formula string to set/parse
     * @return {this} The Formula object (this)
     */
    setFormula(formulaString: string): this;
    /**
     * Enable memoization: An expression is only evaluated once for the same input.
     * Further evaluations with the same input will return the in-memory stored result.
     */
    enableMemoization(): void;
    /**
     * Disable in-memory memoization: each call to evaluate() is executed from scratch.
     */
    disableMemoization(): void;
    /**
     * Splits the given string by ',', makes sure the ',' is not within
     * a sub-expression
     * e.g.: str = "x,pow(3,4)" returns 2 elements: x and pow(3,4).
     */
    splitFunctionParams(toSplit: string): string[];
    /**
     * Cleans the input string from unnecessary whitespace,
     * and replaces some known constants:
     */
    cleanupInputFormula(s: string): string;
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
    parse(str: string): Expression;
    /**
     * @see parse(): this is the recursive parse function, without the clean string part.
     * @param {String} str
     * @returns {Expression} An expression object, representing the expression tree
     */
    _do_parse(str: string): Expression;
    /**
     * @see parse(): Builds an expression tree from the given expression array.
     * Builds a tree with a single root expression in the correct order of operator precedence.
     *
     * Note that the given expression objects are modified and linked.
     *
     * @param {*} expressions
     * @return {Expression} The root Expression of the built expression tree
     */
    buildExpressionTree(expressions: Expression[]): Expression;
    isOperator(char: string | null): false | RegExpMatchArray | null;
    isOperatorExpr(expr: Expression): boolean;
    registerVariable(varName: string): void;
    getVariables(): string[];
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
    evaluate(valueObj: ValueObject | ValueObject[]): number | string | (number | string)[];
    hashValues(valueObj: ValueObject): string;
    resultFromMemory(valueObj: ValueObject): number | string | null;
    storeInMemory(valueObj: ValueObject, value: number | string): void;
    getExpression(): Expression | null;
    getExpressionString(): string;
    static calc(formula: string, valueObj?: ValueObject | null, options?: {}): string | number | (string | number)[];
}
export {};
