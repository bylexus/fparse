import { BracketExpression, Expression, FunctionExpression, LogicalExpression, MultDivExpression, PlusMinusExpression, PowerExpression, ValueExpression, VariableExpression } from './expression';
export { Tokenizer, TokenType } from './tokenizer';
export type { Token } from './tokenizer';
export { Parser } from './parser';
declare global {
    interface Math {
        [key: string]: number | Function;
    }
}
/**
 * Evaluates a variable within a formula to its value. The variable value
 * is expected to be given in the evaluate() method or on the formula object.
 */
/**
 * The Formula class represents a mathematical formula, including functions to evaluate
 * the formula to its final result.
 *
 * Usage example:
 *
 * 1. Create a Formula object instance by passing a formula string:
 * const fObj = new Formula('2^x');
 *
 * 2. evaluate the formula, delivering a value object for each unknown entity:
 * let result = fObj.evaluate({ x: 3 }); // result = 8
 */
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
    static ALLOWED_FUNCTIONS: string[];
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
    parse(str: string): Expression;
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
    ifElse(predicate: any, trueValue: any, falseValue: any): any;
    first(...args: any[]): any;
}
