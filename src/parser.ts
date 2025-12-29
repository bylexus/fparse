/**
 * Parser for Formula Parser
 * Converts a stream of tokens into an Abstract Syntax Tree (AST)
 * Uses Pratt parsing algorithm for operator precedence
 */

import { Token, TokenType } from './tokenizer';
import {
    Expression,
    BracketExpression,
    ValueExpression,
    VariableExpression,
    FunctionExpression,
    MultDivExpression
} from './expression';
import Formula from './fparser';

/**
 * Operator precedence levels (higher = tighter binding)
 */
const PRECEDENCE = {
    // Logical operators (lowest precedence)
    '=': 1,
    '!=': 1,
    '<': 1,
    '>': 1,
    '<=': 1,
    '>=': 1,

    // Addition/Subtraction
    '+': 2,
    '-': 2,

    // Multiplication/Division
    '*': 3,
    '/': 3,

    // Power (highest precedence, right-associative)
    '^': 4
};

/**
 * Parser class that builds an AST from tokens
 */
export class Parser {
    private tokens: Token[];
    private current: number;
    private formulaObject: Formula;

    constructor(tokens: Token[], formulaObject: Formula) {
        this.tokens = tokens;
        this.current = 0;
        this.formulaObject = formulaObject;
    }

    /**
     * Main entry point: Parse the token stream into an Expression tree
     */
    parse(): Expression {
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
    private parseExpression(minPrecedence: number): Expression {
        let left = this.parsePrimary();

        while (!this.isAtEnd()) {
            const token = this.peek();

            // Stop if we hit a non-operator token (parenthesis, comma, etc.)
            if (token.type !== TokenType.OPERATOR && token.type !== TokenType.LOGICAL_OPERATOR) {
                break;
            }

            const precedence = this.getPrecedence(token);

            if (precedence < minPrecedence) break;

            // Handle right-associative operators (power)
            const isRightAssociative = token.value === '^';
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
    private parsePrimary(): Expression {
        const token = this.peek();

        // Handle unary minus: convert to -1 * expr
        if (this.match(TokenType.OPERATOR) && token.value === '-') {
            this.consume();
            const expr = this.parsePrimary();
            return new MultDivExpression('*', new ValueExpression(-1), expr);
        }

        // Handle unary plus: just skip it
        if (this.match(TokenType.OPERATOR) && token.value === '+') {
            this.consume();
            return this.parsePrimary();
        }

        // Numbers
        if (this.match(TokenType.NUMBER)) {
            this.consume();
            return new ValueExpression(token.value);
        }

        // Strings
        if (this.match(TokenType.STRING)) {
            this.consume();
            return new ValueExpression(token.value, 'string');
        }

        // Parenthesized expressions
        if (this.match(TokenType.LEFT_PAREN)) {
            return this.parseParenthesizedExpression();
        }

        // Variables or Functions
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
    private parseParenthesizedExpression(): Expression {
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
    private parseVariableOrFunction(): Expression {
        const token = this.consume();
        const name = token.value as string;

        // Check if it's a function call (next token is '(')
        if (this.match(TokenType.LEFT_PAREN)) {
            return this.parseFunctionCall(name, token.position);
        }

        // It's a variable
        this.formulaObject.registerVariable(name);
        return new VariableExpression(name, this.formulaObject);
    }

    /**
     * Parse a function call: functionName(arg1, arg2, ...)
     */
    private parseFunctionCall(name: string, namePosition: number): Expression {
        const leftParen = this.consume(TokenType.LEFT_PAREN);
        const args: Expression[] = [];

        // Parse arguments (if any)
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
    private peek(): Token {
        return this.tokens[this.current];
    }

    /**
     * Consume the current token and move to the next one
     * @param expected Optional: throw error if current token is not of this type
     */
    private consume(expected?: TokenType): Token {
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
    private match(...types: TokenType[]): boolean {
        return types.includes(this.peek().type);
    }

    /**
     * If the current token matches the given type, consume it and return true
     */
    private matchAndConsume(type: TokenType): boolean {
        if (this.match(type)) {
            this.consume();
            return true;
        }
        return false;
    }

    /**
     * Check if we've reached the end of the token stream
     */
    private isAtEnd(): boolean {
        return this.peek().type === TokenType.EOF;
    }

    /**
     * Get the precedence level for a token
     */
    private getPrecedence(token: Token): number {
        if (token.type === TokenType.LOGICAL_OPERATOR) {
            const op = token.value as string;
            return PRECEDENCE[op as keyof typeof PRECEDENCE] ?? 0;
        }
        if (token.type === TokenType.OPERATOR) {
            const op = token.value as string;
            return PRECEDENCE[op as keyof typeof PRECEDENCE] ?? 0;
        }
        return 0;
    }
}
