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
        while (this.position < this.input.length && /\s/.test(this.input[this.position])) {
            this.position++;
        }
    }

    private peek(offset: number = 0): string {
        return this.input[this.position + offset] || '';
    }

    /**
     * Read a number token. Includes the minus sign if it's unambiguously part of the number.
     * Handles negative numbers when preceded by operators, commas, left parenthesis, or at start.
     */
    private readNumber(tokens: Token[]): Token | null {
        const start = this.position;
        let raw = '';

        // Check for negative sign
        if (this.peek() === '-') {
            // Include '-' as part of the number only if:
            // 1. It's at the start (no previous token)
            // 2. Previous token is an operator (not a number or variable or closing paren)
            // 3. Previous token is a comma
            // 4. Previous token is a left parenthesis
            const prevToken = tokens.length > 0 ? tokens[tokens.length - 1] : null;
            const canBeNegative =
                !prevToken ||
                prevToken.type === TokenType.OPERATOR ||
                prevToken.type === TokenType.LOGICAL_OPERATOR ||
                prevToken.type === TokenType.COMMA ||
                prevToken.type === TokenType.LEFT_PAREN;

            if (canBeNegative && /\d/.test(this.peek(1))) {
                raw += this.peek();
                this.position++;
            } else {
                return null; // Not a number, it's a minus operator
            }
        }

        // Read digits before decimal point
        if (!/\d/.test(this.peek())) {
            // If we consumed a '-' but there's no digit, backtrack
            if (raw === '-') {
                this.position = start;
                return null;
            }
            return null;
        }

        while (/\d/.test(this.peek())) {
            raw += this.peek();
            this.position++;
        }

        // Read decimal point and digits after
        if (this.peek() === '.') {
            raw += this.peek();
            this.position++;

            while (/\d/.test(this.peek())) {
                raw += this.peek();
                this.position++;
            }
        }

        const value = parseFloat(raw);

        return {
            type: TokenType.NUMBER,
            value: value,
            raw: raw,
            position: start,
            length: this.position - start
        };
    }

    /**
     * Read an identifier (variable or function name).
     * Supports: myVar, x, PI, my_var, obj.prop, [myVar], [obj.prop]
     */
    private readIdentifier(): Token | null {
        const start = this.position;
        let raw = '';
        let value = '';
        let isBracketed = false;

        // Check for bracketed variable [varname]
        if (this.peek() === '[') {
            isBracketed = true;
            raw += this.peek();
            this.position++;

            // Read until closing bracket
            while (this.position < this.input.length && this.peek() !== ']') {
                if (!/[a-zA-Z0-9_.]/.test(this.peek())) {
                    throw new Error(
                        `Invalid character '${this.peek()}' in bracketed variable at position ${this.position}`
                    );
                }
                value += this.peek();
                raw += this.peek();
                this.position++;
            }

            if (this.peek() !== ']') {
                throw new Error(`Unclosed bracket for variable at position ${start}`);
            }

            raw += this.peek();
            this.position++; // consume ']'
        } else {
            // Regular identifier
            if (!/[a-zA-Z_]/.test(this.peek())) {
                return null;
            }

            while (/[a-zA-Z0-9_.]/.test(this.peek())) {
                value += this.peek();
                raw += this.peek();
                this.position++;
            }
        }

        if (value === '') {
            if (isBracketed) {
                throw new Error(`Empty bracketed variable at position ${start}`);
            }
            return null;
        }

        // Look ahead to determine if this is a function call
        let savedPos = this.position;
        this.skipWhitespace();
        const isFunction = this.peek() === '(';
        this.position = savedPos; // restore position (whitespace will be skipped in main loop)

        return {
            type: isFunction ? TokenType.FUNCTION : TokenType.VARIABLE,
            value: value,
            raw: raw,
            position: start,
            length: this.position - start
        };
    }

    /**
     * Read a string literal (single or double quoted).
     * Supports escaped quotes: \" or \'
     */
    private readString(): Token | null {
        const start = this.position;
        const quote = this.peek();

        if (quote !== '"' && quote !== "'") {
            return null;
        }

        let raw = quote;
        let value = '';
        this.position++; // consume opening quote

        while (this.position < this.input.length) {
            const char = this.peek();

            if (char === '\\' && (this.peek(1) === quote || this.peek(1) === '\\')) {
                // Escaped quote or backslash
                const escapedChar = this.peek(1);
                raw += char + escapedChar;
                value += escapedChar;
                this.position += 2;
            } else if (char === quote) {
                // Closing quote
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
            type: TokenType.STRING,
            value: value,
            raw: raw,
            position: start,
            length: this.position - start
        };
    }

    /**
     * Read a simple operator: +, -, *, /, ^
     */
    private readOperator(): Token | null {
        const char = this.peek();
        const operatorPattern = /[+\-*/^]/;

        if (!operatorPattern.test(char)) {
            return null;
        }

        const start = this.position;
        this.position++;

        return {
            type: TokenType.OPERATOR,
            value: char,
            raw: char,
            position: start,
            length: 1
        };
    }

    /**
     * Read a logical operator: <, >, <=, >=, =, !=
     */
    private readLogicalOperator(): Token | null {
        const start = this.position;
        const char = this.peek();
        const nextChar = this.peek(1);

        // Two-character logical operators
        if (
            (char === '<' && nextChar === '=') ||
            (char === '>' && nextChar === '=') ||
            (char === '!' && nextChar === '=')
        ) {
            const raw = char + nextChar;
            this.position += 2;
            return {
                type: TokenType.LOGICAL_OPERATOR,
                value: raw,
                raw: raw,
                position: start,
                length: 2
            };
        }

        // Single-character logical operators
        if (char === '<' || char === '>' || char === '=') {
            this.position++;
            return {
                type: TokenType.LOGICAL_OPERATOR,
                value: char,
                raw: char,
                position: start,
                length: 1
            };
        }

        // '!' by itself is not valid (only != is valid)
        if (char === '!') {
            throw new Error(`Invalid operator '!' at position ${start}. Did you mean '!='?`);
        }

        return null;
    }

    /**
     * Read parentheses
     */
    private readParenthesis(): Token | null {
        const char = this.peek();
        const start = this.position;

        if (char === '(') {
            this.position++;
            return {
                type: TokenType.LEFT_PAREN,
                value: '(',
                raw: '(',
                position: start,
                length: 1
            };
        }

        if (char === ')') {
            this.position++;
            return {
                type: TokenType.RIGHT_PAREN,
                value: ')',
                raw: ')',
                position: start,
                length: 1
            };
        }

        return null;
    }

    /**
     * Read comma separator
     */
    private readComma(): Token | null {
        const char = this.peek();
        const start = this.position;

        if (char === ',') {
            this.position++;
            return {
                type: TokenType.COMMA,
                value: ',',
                raw: ',',
                position: start,
                length: 1
            };
        }

        return null;
    }

    /**
     * Throw an error for unexpected characters
     */
    private throwUnexpectedChar(): never {
        const char = this.peek();
        throw new Error(`Unexpected character '${char}' at position ${this.position}`);
    }
}
