/**
 * Parser for Formula Parser
 * Converts a stream of tokens into an Abstract Syntax Tree (AST)
 * Uses Pratt parsing algorithm for operator precedence
 */
import { Token } from './tokenizer';
import { Expression } from './expression';
import Formula from './fparser';
/**
 * Parser class that builds an AST from tokens
 */
export declare class Parser {
    private tokens;
    private current;
    private formulaObject;
    constructor(tokens: Token[], formulaObject: Formula);
    /**
     * Main entry point: Parse the token stream into an Expression tree
     */
    parse(): Expression;
    /**
     * Pratt parsing: handles operator precedence elegantly
     * @param minPrecedence Minimum precedence level to parse
     */
    private parseExpression;
    /**
     * Parse primary expressions: numbers, variables, functions, parentheses, unary operators
     */
    private parsePrimary;
    /**
     * Parse a parenthesized expression: (expr)
     */
    private parseParenthesizedExpression;
    /**
     * Parse a variable or function call
     */
    private parseVariableOrFunction;
    /**
     * Parse a function call: functionName(arg1, arg2, ...)
     */
    private parseFunctionCall;
    /**
     * Get the current token without consuming it
     */
    private peek;
    /**
     * Consume the current token and move to the next one
     * @param expected Optional: throw error if current token is not of this type
     */
    private consume;
    /**
     * Check if the current token matches any of the given types
     */
    private match;
    /**
     * If the current token matches the given type, consume it and return true
     */
    private matchAndConsume;
    /**
     * Check if we've reached the end of the token stream
     */
    private isAtEnd;
    /**
     * Get the precedence level for a token
     */
    private getPrecedence;
}
