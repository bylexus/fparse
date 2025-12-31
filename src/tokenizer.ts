/**
 * Tokenizer for Formula Parser
 * Converts a formula string into a stream of tokens
 */

export enum TokenType {
    NUMBER = 'NUMBER',
    VARIABLE = 'VARIABLE',
    OPERATOR = 'OPERATOR',
    LOGICAL_OPERATOR = 'LOGICAL_OPERATOR',
    FUNCTION = 'FUNCTION',
    LEFT_PAREN = 'LEFT_PAREN',
    RIGHT_PAREN = 'RIGHT_PAREN',
    COMMA = 'COMMA',
    STRING = 'STRING',
    EOF = 'EOF'
}

export interface Token {
    type: TokenType;
    value: string | number;
    raw: string;           // original text from input
    position: number;      // character position in input
    length: number;        // length of the token in original input
}

export class Tokenizer {
    private input: string;
    private position: number;

    // Regex patterns for token matching
    private static readonly PATTERNS = {
        WHITESPACE: /^\s+/,
        NUMBER: /^-?\d+(\.\d+)?([eE][+\-]?\d+)?/,
        IDENTIFIER: /^[a-zA-Z_][a-zA-Z0-9_.]*/,
        BRACKETED_IDENTIFIER: /^\[([^\]]*)\]/,  // Match anything between brackets, validate later
        STRING_DOUBLE: /^"((?:[^"\\]|\\.)*)"/,
        STRING_SINGLE: /^'((?:[^'\\]|\\.)*)'/,
        LOGICAL_OPERATOR: /^(<=|>=|!=|<|>|=)/,
        OPERATOR: /^[+\-*/^]/,
        LEFT_PAREN: /^\(/,
        RIGHT_PAREN: /^\)/,
        COMMA: /^,/
    };

    constructor() {
        this.input = '';
        this.position = 0;
    }

    tokenize(input: string): Token[] {
        this.input = input;
        this.position = 0;
        const tokens: Token[] = [];

        while (this.position < this.input.length) {
            this.skipWhitespace();

            if (this.position >= this.input.length) break;

            const token = this.nextToken(tokens);
            if (token) {
                tokens.push(token);
            }
        }

        tokens.push({
            type: TokenType.EOF,
            value: '',
            raw: '',
            position: this.position,
            length: 0
        });
        return tokens;
    }

    private nextToken(tokens: Token[]): Token | null {
        // Try each token pattern in order
        // String must be checked first to avoid conflicts
        return (
            this.readString() ||
            this.readLogicalOperator() ||
            this.readNumber(tokens) ||
            this.readOperator() ||
            this.readParenthesis() ||
            this.readComma() ||
            this.readIdentifier() ||
            this.throwUnexpectedChar()
        );
    }

    private skipWhitespace(): void {
        const remaining = this.input.slice(this.position);
        const match = remaining.match(Tokenizer.PATTERNS.WHITESPACE);
        if (match) {
            this.position += match[0].length;
        }
    }

    private remaining(): string {
        return this.input.slice(this.position);
    }

    /**
     * Read a number token. Includes the minus sign if it's unambiguously part of the number.
     * Handles negative numbers when preceded by operators, commas, left parenthesis, or at start.
     * Supports scientific notation (e.g., 1.23e5, 1.23E+5, 1.23e-5).
     */
    private readNumber(tokens: Token[]): Token | null {
        const start = this.position;
        const remaining = this.remaining();

        // Try to match a number (with optional negative sign)
        const match = remaining.match(Tokenizer.PATTERNS.NUMBER);
        if (!match) {
            return null;
        }

        const raw = match[0];

        // If the number starts with '-', check if it's actually a negative number
        // or if the '-' should be treated as a separate operator
        if (raw.startsWith('-')) {
            const prevToken = tokens.length > 0 ? tokens[tokens.length - 1] : null;
            const canBeNegative =
                !prevToken ||
                prevToken.type === TokenType.OPERATOR ||
                prevToken.type === TokenType.LOGICAL_OPERATOR ||
                prevToken.type === TokenType.COMMA ||
                prevToken.type === TokenType.LEFT_PAREN;

            if (!canBeNegative) {
                // The '-' is an operator, not part of the number
                return null;
            }
        }

        this.position += raw.length;
        const value = parseFloat(raw);

        return {
            type: TokenType.NUMBER,
            value: value,
            raw: raw,
            position: start,
            length: raw.length
        };
    }

    /**
     * Read an identifier (variable or function name).
     * Supports: myVar, x, PI, my_var, obj.prop, [myVar], [obj.prop]
     */
    private readIdentifier(): Token | null {
        const start = this.position;
        const remaining = this.remaining();

        // Try bracketed identifier first: [varname]
        let match = remaining.match(Tokenizer.PATTERNS.BRACKETED_IDENTIFIER);
        if (match) {
            const raw = match[0];
            const value = match[1]; // captured group without brackets

            if (value === '') {
                throw new Error(`Empty bracketed variable at position ${start}`);
            }

            // Validate that the content only contains valid identifier characters
            if (!/^[a-zA-Z0-9_.]+$/.test(value)) {
                // Find the first invalid character
                const invalidCharMatch = value.match(/[^a-zA-Z0-9_.]/);
                const invalidChar = invalidCharMatch ? invalidCharMatch[0] : value[0];
                const invalidCharPos = start + 1 + value.indexOf(invalidChar);
                throw new Error(
                    `Invalid character '${invalidChar}' in bracketed variable at position ${invalidCharPos}`
                );
            }

            this.position += raw.length;

            // Look ahead to determine if this is a function call
            const savedPos = this.position;
            this.skipWhitespace();
            const isFunction = this.position < this.input.length && this.input[this.position] === '(';
            this.position = savedPos; // restore position

            return {
                type: isFunction ? TokenType.FUNCTION : TokenType.VARIABLE,
                value: value,
                raw: raw,
                position: start,
                length: raw.length
            };
        }

        // Try regular identifier: myVar, x, PI
        match = remaining.match(Tokenizer.PATTERNS.IDENTIFIER);
        if (match) {
            const raw = match[0];
            const value = raw;
            this.position += raw.length;

            // Look ahead to determine if this is a function call
            const savedPos = this.position;
            this.skipWhitespace();
            const isFunction = this.position < this.input.length && this.input[this.position] === '(';
            this.position = savedPos; // restore position

            return {
                type: isFunction ? TokenType.FUNCTION : TokenType.VARIABLE,
                value: value,
                raw: raw,
                position: start,
                length: raw.length
            };
        }

        return null;
    }

    /**
     * Read a string literal (single or double quoted).
     * Supports escaped quotes: \" or \'
     */
    private readString(): Token | null {
        const start = this.position;
        const remaining = this.remaining();

        // Try double-quoted string
        let match = remaining.match(Tokenizer.PATTERNS.STRING_DOUBLE);
        if (match) {
            const raw = match[0];
            const capturedValue = match[1]; // content between quotes
            // Process escape sequences: \\ -> \, \" -> "
            const value = capturedValue.replace(/\\(.)/g, '$1');
            this.position += raw.length;

            return {
                type: TokenType.STRING,
                value: value,
                raw: raw,
                position: start,
                length: raw.length
            };
        }

        // Try single-quoted string
        match = remaining.match(Tokenizer.PATTERNS.STRING_SINGLE);
        if (match) {
            const raw = match[0];
            const capturedValue = match[1]; // content between quotes
            // Process escape sequences: \\ -> \, \' -> '
            const value = capturedValue.replace(/\\(.)/g, '$1');
            this.position += raw.length;

            return {
                type: TokenType.STRING,
                value: value,
                raw: raw,
                position: start,
                length: raw.length
            };
        }

        // Check for unterminated string
        if (remaining.startsWith('"') || remaining.startsWith("'")) {
            throw new Error(`Unterminated string at position ${start}`);
        }

        return null;
    }

    /**
     * Read a simple operator: +, -, *, /, ^
     */
    private readOperator(): Token | null {
        const start = this.position;
        const remaining = this.remaining();

        const match = remaining.match(Tokenizer.PATTERNS.OPERATOR);
        if (!match) {
            return null;
        }

        const raw = match[0];
        this.position += raw.length;

        return {
            type: TokenType.OPERATOR,
            value: raw,
            raw: raw,
            position: start,
            length: raw.length
        };
    }

    /**
     * Read a logical operator: <, >, <=, >=, =, !=
     */
    private readLogicalOperator(): Token | null {
        const start = this.position;
        const remaining = this.remaining();

        // Check for invalid '!' operator
        if (remaining.startsWith('!') && !remaining.startsWith('!=')) {
            throw new Error(`Invalid operator '!' at position ${start}. Did you mean '!='?`);
        }

        const match = remaining.match(Tokenizer.PATTERNS.LOGICAL_OPERATOR);
        if (!match) {
            return null;
        }

        const raw = match[0];
        this.position += raw.length;

        return {
            type: TokenType.LOGICAL_OPERATOR,
            value: raw,
            raw: raw,
            position: start,
            length: raw.length
        };
    }

    /**
     * Read parentheses
     */
    private readParenthesis(): Token | null {
        const start = this.position;
        const remaining = this.remaining();

        // Try left parenthesis
        let match = remaining.match(Tokenizer.PATTERNS.LEFT_PAREN);
        if (match) {
            const raw = match[0];
            this.position += raw.length;
            return {
                type: TokenType.LEFT_PAREN,
                value: raw,
                raw: raw,
                position: start,
                length: raw.length
            };
        }

        // Try right parenthesis
        match = remaining.match(Tokenizer.PATTERNS.RIGHT_PAREN);
        if (match) {
            const raw = match[0];
            this.position += raw.length;
            return {
                type: TokenType.RIGHT_PAREN,
                value: raw,
                raw: raw,
                position: start,
                length: raw.length
            };
        }

        return null;
    }

    /**
     * Read comma separator
     */
    private readComma(): Token | null {
        const start = this.position;
        const remaining = this.remaining();

        const match = remaining.match(Tokenizer.PATTERNS.COMMA);
        if (!match) {
            return null;
        }

        const raw = match[0];
        this.position += raw.length;

        return {
            type: TokenType.COMMA,
            value: raw,
            raw: raw,
            position: start,
            length: raw.length
        };
    }

    /**
     * Throw an error for unexpected characters
     */
    private throwUnexpectedChar(): never {
        const char = this.input[this.position] || 'EOF';
        throw new Error(`Unexpected character '${char}' at position ${this.position}`);
    }
}
