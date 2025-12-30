import Formula from "./fparser";
import { getProperty } from "./helpers";
import { MathFunctionHelper } from "./math_function_helper";
import { MathOperatorHelper } from "./math_operator_helper";
import type { Token } from "./tokenizer";

/**
 * Base class for all expressions: An Expression is somethint that eventually evaluates to a
 * final value, like a number, or a string. It can be composed of other expressions, which
 * are evaluated recursively until a final value is reached.
 */
export abstract class Expression {
    /**
     * Creates an operator expression from a token.
     * @param operatorToken The operator token (or string for backward compatibility)
     * @param left Left operand expression
     * @param right Right operand expression
     */
    static createOperatorExpression(
        operatorToken: Token | string,
        left: Expression,
        right: Expression
    ) {
        // Extract operator string from token or use directly if it's a string (backward compatibility)
        const operator = typeof operatorToken === 'string' ? operatorToken : String(operatorToken.value);

        if (operator === '^') {
            return new PowerExpression(left, right);
        }
        if (['*', '/'].includes(operator)) {
            return new MultDivExpression(operator, left, right);
        }
        if (['+', '-'].includes(operator)) {
            return new PlusMinusExpression(operator, left, right);
        }
        if (['<', '>', '<=', '>=', '=', '!='].includes(operator)) {
            return new LogicalExpression(operator, left, right);
        }
        throw new Error(`Unknown operator: ${operator}`);
    }

    abstract evaluate(params: ValueObject): any;

    toString() {
        return '';
    }
}

/**
 * An unused expression - it is only used during parsing stage, to store a placeholder for a
 * real expression later.
 */
export class PlaceholderExpression extends Expression {
    evaluate(params: ValueObject): number | string {
        throw new Error('PlaceholderExpression cannot be evaluated');
    }
    toString() {
        return '[placeholder]';
    }
}

/**
 * Represents a bracketed expression: (expr)
 * It evaluates its inner expression.
 */
export class BracketExpression extends Expression {
    innerExpression: Expression;

    constructor(expr: Expression) {
        super();
        this.innerExpression = expr;
        if (!(this.innerExpression instanceof Expression)) {
            throw new Error('No inner expression given for bracket expression');
        }
    }
    evaluate(params = {}): number | string {
        return this.innerExpression.evaluate(params);
    }
    toString() {
        return `(${this.innerExpression.toString()})`;
    }
}

/**
 * Represents a final value, e.g. a number.
 */
export class ValueExpression extends Expression {
    value: number | string;
    type: string;

    constructor(value: number | string, type: string = 'number') {
        super();
        this.value = Number(value);
        switch (type) {
            case 'number':
                this.value = Number(value);
                if (isNaN(this.value)) {
                    throw new Error('Cannot parse number: ' + value);
                }
                break;
            case 'string':
                this.value = String(value);
                break;
            default:
                throw new Error('Invalid value type: ' + type);
        }
        this.type = type;
    }
    evaluate(): number | string {
        return this.value;
    }
    toString() {
        switch (this.type) {
            case 'number':
                return String(this.value);
            case 'string':
                return String('"' + this.value + '"');
            default:
                throw new Error('Invalid type');
        }
    }
}

/**
 * Represents the '+' or '-' operator expression:
 * it evaluates its left and right expression and returns the sum / difference of the result
 */
export class PlusMinusExpression extends Expression {
    static PLUS = '+';
    static MINUS = '-';

    operator: string;
    left: Expression;
    right: Expression;

    constructor(operator: string, left: Expression, right: Expression) {
        super();
        if (!['+', '-'].includes(operator)) {
            throw new Error(`Operator not allowed in Plus/Minus expression: ${operator}`);
        }
        this.operator = operator;
        this.left = left;
        this.right = right;
    }

    evaluate(params: ValueObject = {}): number {
        const leftValue = this.left.evaluate(params);
        const rightValue = this.right.evaluate(params);
        MathOperatorHelper.throwIfNotNumber(leftValue);
        MathOperatorHelper.throwIfNotNumber(rightValue);
        if (this.operator === '+') {
            return Number(leftValue) + Number(rightValue);
        }
        if (this.operator === '-') {
            return Number(leftValue) - Number(rightValue);
        }
        throw new Error('Unknown operator for PlusMinus expression');
    }

    toString() {
        return `${this.left.toString()} ${this.operator} ${this.right.toString()}`;
    }
}

/**
 * Represents the '*' or '/' operator expression:
 * it evaluates its left and right expression and returns the product / division of the two.
 */
export class MultDivExpression extends Expression {
    static MULT = '*';
    static DIV = '/';

    operator: string;
    left: Expression;
    right: Expression;

    constructor(operator: string, left: Expression, right: Expression) {
        super();
        if (!['*', '/'].includes(operator)) {
            throw new Error(`Operator not allowed in Multiply/Division expression: ${operator}`);
        }
        this.operator = operator;
        this.left = left;
        this.right = right;
    }

    evaluate(params: ValueObject = {}): number {
        const leftValue = this.left.evaluate(params);
        const rightValue = this.right.evaluate(params);
        MathOperatorHelper.throwIfNotNumber(leftValue);
        MathOperatorHelper.throwIfNotNumber(rightValue);
        if (this.operator === '*') {
            return Number(leftValue) * Number(rightValue);
        }
        if (this.operator === '/') {
            return Number(leftValue) / Number(rightValue);
        }
        throw new Error('Unknown operator for MultDiv expression');
    }

    toString() {
        return `${this.left.toString()} ${this.operator} ${this.right.toString()}`;
    }
}

/**
 * Represents the 'power of' operator expression:
 * evaluates base^exponent.
 */
export class PowerExpression extends Expression {
    base: Expression;
    exponent: Expression;

    constructor(base: Expression, exponent: Expression) {
        super();
        this.base = base;
        this.exponent = exponent;
    }

    evaluate(params: ValueObject = {}): number {
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

/**
 * Represents locical operator expressions: All logical operations
 * evaluate either to 0 or 1 (false or true): this way, you can use them in calculations
 * to enable / disable different parts of the formula.
 */
export class LogicalExpression extends Expression {
    static LT = '<';
    static GT = '>';
    static LTE = '<=';
    static GTE = '>=';
    static EQ = '=';
    static NEQ = '!=';

    operator: string;
    left: Expression;
    right: Expression;

    constructor(operator: string, left: Expression, right: Expression) {
        super();
        if (!['<', '>', '<=', '>=', '=', '!='].includes(operator)) {
            throw new Error(`Operator not allowed in Logical expression: ${operator}`);
        }
        this.operator = operator;
        this.left = left;
        this.right = right;
    }

    evaluate(params: ValueObject = {}): number {
        const leftValue = this.left.evaluate(params);
        const rightValue = this.right.evaluate(params);
        switch (this.operator) {
            case '<':
                return leftValue < rightValue ? 1 : 0;
            case '>':
                return leftValue > rightValue ? 1 : 0;
            case '<=':
                return leftValue <= rightValue ? 1 : 0;
            case '>=':
                return leftValue >= rightValue ? 1 : 0;
            case '=':
                return leftValue === rightValue ? 1 : 0;
            case '!=':
                return leftValue !== rightValue ? 1 : 0;
        }
        throw new Error('Unknown operator for Logical expression');
    }

    toString() {
        return `${this.left.toString()} ${this.operator} ${this.right.toString()}`;
    }
}

/**
 * Represents a function expression: evaluates the expression in the function arguments,
 * then executes the function with the evaluated arguments, an evaluates the result.
 */
export class FunctionExpression extends Expression {
    fn: string;
    varPath: string[];
    argumentExpressions: Expression[];
    formulaObject: Formula | null;
    blacklisted: boolean | undefined;

    constructor(fn: string | null, argumentExpressions: Expression[], formulaObject: Formula | null = null) {
        super();
        this.fn = fn ?? '';
        this.varPath = this.fn.split('.');
        this.argumentExpressions = argumentExpressions || [];
        this.formulaObject = formulaObject;
        this.blacklisted = undefined;
    }

    evaluate(params: ValueObject = {}): number | string {
        params = params || {};
        const paramValues = this.argumentExpressions.map((a) => a.evaluate(params));

        // If the params object itself has a function definition with
        // the function name, call this one:
        // let fn = params[this.fn];
        try {
            let fn = getProperty(params, this.varPath, this.fn);
            if (fn instanceof Function) {
                return fn.apply(this, paramValues);
            }
        } catch (e) {
            // pass: getProperty has found nothing, which throws an error, but
            // we need to continue
        }

        let objFn;
        try {
            // perhaps the Formula object has the function? so call it:
            objFn = getProperty(this.formulaObject ?? {}, this.varPath, this.fn);
        } catch (e) {
            // pass: getProperty has found nothing, which throws an error, but
            // we need to continue
        }
        if (this.formulaObject && objFn instanceof Function) {
            // Don't, if it is blacklisted:
            if (this.isBlacklisted()) {
                throw new Error('Blacklisted function called: ' + this.fn);
            }
            return objFn.apply(this.formulaObject, paramValues);
        }

        try {
            // Has the JS Math object a function as requested? Call it:
            const mathFn = getProperty(Math, this.varPath, this.fn);
            if (mathFn instanceof Function) {
                paramValues.forEach((paramValue) => {
                    MathFunctionHelper.throwIfNotNumber(paramValue);
                });

                return mathFn.apply(this, paramValues);
            }
        } catch (e) {
            // pass: getProperty has found nothing, which throws an error, but
            // we need to continue
        }
        // No more options left: sorry!
        throw new Error('Function not found: ' + this.fn);
    }

    toString() {
        return `${this.fn}(${this.argumentExpressions.map((a) => a.toString()).join(', ')})`;
    }

    isBlacklisted() {
        // cache evaluation of blacklisted function, to save call time:
        if (this.blacklisted === undefined) {
            this.blacklisted = Formula.functionBlacklist.includes(
                this.formulaObject ? this.formulaObject[this.fn] : null
            );
        }
        return this.blacklisted;
    }
}

export class VariableExpression extends Expression {
    fullPath: string;
    varPath: string[];
    formulaObject: Formula | null;

    constructor(fullPath: string, formulaObj: Formula | null = null) {
        super();
        this.formulaObject = formulaObj;
        this.fullPath = fullPath;
        this.varPath = fullPath.split('.');
    }

    evaluate(params = {}): any {
        // params contain variable / value pairs: If this object's variable matches
        // a varname found in the params, return the value.
        // eg: params = {x: 5,y:3}, varname = x, return 5
        // Objects and arrays are also supported:
        // e.g. params = {x: {y: 5}}, varname = x.y, return 5
        //  or  params = {x: [2,4,6]}, varname = x.2, return 6
        // Objects can also be passed as function arguments:
        // e.g. params = {p1: {x: 1, y: 2}}, varname = p1, return {x: 1, y: 2}

        // Let's look in the value object first:
        let value = undefined;
        try {
            value = getProperty(params, this.varPath, this.fullPath);
        } catch (e) {
            // pass: getProperty has found nothing, which throws an error, but
            // we need to continue
        }
        if (value === undefined) {
            // Now have a look at the formula object:
            // This will throw an error if the property is not found:
            value = getProperty(this.formulaObject ?? {}, this.varPath, this.fullPath);
        }
        if (typeof value === 'function') {
            throw new Error(`Cannot use ${this.fullPath} as value: It is a function and not allowed as a variable value.`);
        }

        return value;
    }
    toString() {
        return `${this.varPath.join('.')}`;
    }
}