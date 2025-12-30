/**
 * Tokenizer for Formula Parser
 * Converts a formula string into a stream of tokens
 */
export declare enum TokenType {
    NUMBER = "NUMBER",
    VARIABLE = "VARIABLE",
    OPERATOR = "OPERATOR",
    LOGICAL_OPERATOR = "LOGICAL_OPERATOR",
    FUNCTION = "FUNCTION",
    LEFT_PAREN = "LEFT_PAREN",
    RIGHT_PAREN = "RIGHT_PAREN",
    COMMA = "COMMA",
    STRING = "STRING",
    EOF = "EOF"
}
export interface Token {
    type: TokenType;
    value: string | number;
    raw: string;
    position: number;
    length: number;
}
export declare class Tokenizer {
    private input;
    private position;
    private static readonly PATTERNS;
    constructor();
    tokenize(input: string): Token[];
    private nextToken;
    private skipWhitespace;
    private remaining;
    /**
     * Read a number token. Includes the minus sign if it's unambiguously part of the number.
     * Handles negative numbers when preceded by operators, commas, left parenthesis, or at start.
     */
    private readNumber;
    /**
     * Read an identifier (variable or function name).
     * Supports: myVar, x, PI, my_var, obj.prop, [myVar], [obj.prop]
     */
    private readIdentifier;
    /**
     * Read a string literal (single or double quoted).
     * Supports escaped quotes: \" or \'
     */
    private readString;
    /**
     * Read a simple operator: +, -, *, /, ^
     */
    private readOperator;
    /**
     * Read a logical operator: <, >, <=, >=, =, !=
     */
    private readLogicalOperator;
    /**
     * Read parentheses
     */
    private readParenthesis;
    /**
     * Read comma separator
     */
    private readComma;
    /**
     * Throw an error for unexpected characters
     */
    private throwUnexpectedChar;
}
