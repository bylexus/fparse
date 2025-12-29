import Formula from "./fparser";
import type { Token } from "./tokenizer";
/**
 * Base class for all expressions: An Expression is somethint that eventually evaluates to a
 * final value, like a number, or a string. It can be composed of other expressions, which
 * are evaluated recursively until a final value is reached.
 */
export declare abstract class Expression {
    /**
     * Creates an operator expression from a token.
     * @param operatorToken The operator token (or string for backward compatibility)
     * @param left Left operand expression
     * @param right Right operand expression
     */
    static createOperatorExpression(operatorToken: Token | string, left: Expression, right: Expression): PowerExpression | MultDivExpression | PlusMinusExpression | LogicalExpression;
    abstract evaluate(params: ValueObject): number | string;
    toString(): string;
}
/**
 * An unused expression - it is only used during parsing stage, to store a placeholder for a
 * real expression later.
 */
export declare class PlaceholderExpression extends Expression {
    evaluate(params: ValueObject): number | string;
    toString(): string;
}
/**
 * Represents a bracketed expression: (expr)
 * It evaluates its inner expression.
 */
export declare class BracketExpression extends Expression {
    innerExpression: Expression;
    constructor(expr: Expression);
    evaluate(params?: {}): number | string;
    toString(): string;
}
/**
 * Represents a final value, e.g. a number.
 */
export declare class ValueExpression extends Expression {
    value: number | string;
    type: string;
    constructor(value: number | string, type?: string);
    evaluate(): number | string;
    toString(): string;
}
/**
 * Represents the '+' or '-' operator expression:
 * it evaluates its left and right expression and returns the sum / difference of the result
 */
export declare class PlusMinusExpression extends Expression {
    static PLUS: string;
    static MINUS: string;
    operator: string;
    left: Expression;
    right: Expression;
    constructor(operator: string, left: Expression, right: Expression);
    evaluate(params?: ValueObject): number;
    toString(): string;
}
/**
 * Represents the '*' or '/' operator expression:
 * it evaluates its left and right expression and returns the product / division of the two.
 */
export declare class MultDivExpression extends Expression {
    static MULT: string;
    static DIV: string;
    operator: string;
    left: Expression;
    right: Expression;
    constructor(operator: string, left: Expression, right: Expression);
    evaluate(params?: ValueObject): number;
    toString(): string;
}
/**
 * Represents the 'power of' operator expression:
 * evaluates base^exponent.
 */
export declare class PowerExpression extends Expression {
    base: Expression;
    exponent: Expression;
    constructor(base: Expression, exponent: Expression);
    evaluate(params?: ValueObject): number;
    toString(): string;
}
/**
 * Represents locical operator expressions: All logical operations
 * evaluate either to 0 or 1 (false or true): this way, you can use them in calculations
 * to enable / disable different parts of the formula.
 */
export declare class LogicalExpression extends Expression {
    static LT: string;
    static GT: string;
    static LTE: string;
    static GTE: string;
    static EQ: string;
    static NEQ: string;
    operator: string;
    left: Expression;
    right: Expression;
    constructor(operator: string, left: Expression, right: Expression);
    evaluate(params?: ValueObject): number;
    toString(): string;
}
/**
 * Represents a function expression: evaluates the expression in the function arguments,
 * then executes the function with the evaluated arguments, an evaluates the result.
 */
export declare class FunctionExpression extends Expression {
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
export declare class VariableExpression extends Expression {
    fullPath: string;
    varPath: string[];
    formulaObject: Formula | null;
    constructor(fullPath: string, formulaObj?: Formula | null);
    evaluate(params?: {}): number | string;
    toString(): string;
}
