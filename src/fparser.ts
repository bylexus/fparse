import {
    BracketExpression,
    Expression,
    FunctionExpression,
    LogicalExpression,
    MultDivExpression,
    PlusMinusExpression,
    PowerExpression,
    ValueExpression,
    VariableExpression
} from './expression';

import { Tokenizer } from './tokenizer';
import { Parser } from './parser';

export { Tokenizer, TokenType } from './tokenizer';
export type { Token } from './tokenizer';
export { Parser } from './parser';

/**
 * JS Formula Parser
 * -------------------
 * (c) 2012-2024 Alexander Schenkel, alex@alexi.ch
 *
 * JS Formula Parser takes a string, parses its mathmatical formula
 * and creates an evaluatable Formula object of it.
 *
 * Example input:
 *
 * var fObj = new Formula('sin(PI*x)/(2*PI)');
 * var result = fObj.evaluate({x: 2});
 * var results = fObj.evaluate([
 *     {x: 2},
 *     {x: 4},
 *     {x: 8}
 * ]);
 *
 * LICENSE:
 * -------------
 * MIT license, see LICENSE file
 */
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
    static Expression = Expression;
    static BracketExpression = BracketExpression;
    static PowerExpression = PowerExpression;
    static MultDivExpression = MultDivExpression;
    static PlusMinusExpression = PlusMinusExpression;
    static LogicalExpression = LogicalExpression;
    static ValueExpression = ValueExpression;
    static VariableExpression = VariableExpression;
    static FunctionExpression = FunctionExpression;
    static MATH_CONSTANTS = MATH_CONSTANTS;
    static ALLOWED_FUNCTIONS: string[] = ['ifElse', 'first'];

    // Create a function blacklist:
    static functionBlacklist = Object.getOwnPropertyNames(Formula.prototype)
        .filter((prop) => Formula.prototype[prop] instanceof Function && !this.ALLOWED_FUNCTIONS.includes(prop))
        .map((prop) => Formula.prototype[prop]);

    public formulaExpression: Expression | null;
    public options: FormulaOptions;
    public formulaStr: string;
    private _variables: string[];
    private _memory: { [key: string]: number | string };

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
    constructor(fStr: string, options: FormulaOptions | null = {}) {
        this.formulaExpression = null;
        this.options = { ...{ memoization: false }, ...options };
        this.formulaStr = '';
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
    setFormula(formulaString: string) {
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
    parse(str: string): Expression {
        // Phase 1: Tokenize the input string
        // The tokenizer handles whitespace automatically via skipWhitespace()
        const tokenizer = new Tokenizer();
        const tokens = tokenizer.tokenize(str);

        // Phase 2: Parse the token stream into an AST
        const parser = new Parser(tokens, this);
        return parser.parse();
    }


    registerVariable(varName: string) {
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
    evaluate(valueObj: ValueObject | ValueObject[]): number | string | (number | string)[] {
        // resolve multiple value objects recursively:
        if (valueObj instanceof Array) {
            return valueObj.map((v) => this.evaluate(v)) as (number | string)[];
        }
        let expr = this.getExpression();
        if (!(expr instanceof Expression)) {
            throw new Error('No expression set: Did you init the object with a Formula?');
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

    hashValues(valueObj: ValueObject) {
        return JSON.stringify(valueObj);
    }

    resultFromMemory(valueObj: ValueObject): number | string | null {
        let key = this.hashValues(valueObj);
        let res = this._memory[key];
        if (res !== undefined) {
            return res;
        } else {
            return null;
        }
    }

    storeInMemory(valueObj: ValueObject, value: number | string) {
        this._memory[this.hashValues(valueObj)] = value;
    }

    getExpression() {
        return this.formulaExpression;
    }

    getExpressionString() {
        return this.formulaExpression ? this.formulaExpression.toString() : '';
    }

    static calc(formula: string, valueObj: ValueObject | null = null, options = {}) {
        valueObj = valueObj ?? {};
        return new Formula(formula, options).evaluate(valueObj);
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
    ifElse(predicate: any, trueValue: any, falseValue: any): any {
        if (predicate) {
            return trueValue;
        } else {
            return falseValue;
        }
    }

    first(...args: any[]): any {
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
        throw new Error('first(): At least one argument is required');
    }
}
