import Formula from '../../dist/fparser.js';

const Tokenizer = Formula.Tokenizer;
const TokenType = Formula.TokenType;

describe('Tokenizer', function () {
    let tokenizer;

    beforeEach(function () {
        tokenizer = new Tokenizer();
    });

    describe('Number Tokens', function () {
        it('should tokenize positive integers', function () {
            const tokens = tokenizer.tokenize('42');
            expect(tokens.length).toBe(2); // NUMBER + EOF
            expect(tokens[0].type).toBe(TokenType.NUMBER);
            expect(tokens[0].value).toBe(42);
            expect(tokens[0].raw).toBe('42');
            expect(tokens[0].position).toBe(0);
            expect(tokens[0].length).toBe(2);
        });

        it('should tokenize decimal numbers', function () {
            const tokens = tokenizer.tokenize('3.14');
            expect(tokens[0].type).toBe(TokenType.NUMBER);
            expect(tokens[0].value).toBe(3.14);
            expect(tokens[0].raw).toBe('3.14');
        });

        it('should tokenize negative numbers at start', function () {
            const tokens = tokenizer.tokenize('-5');
            expect(tokens[0].type).toBe(TokenType.NUMBER);
            expect(tokens[0].value).toBe(-5);
            expect(tokens[0].raw).toBe('-5');
        });

        it('should tokenize negative decimal numbers', function () {
            const tokens = tokenizer.tokenize('-3.14');
            expect(tokens[0].value).toBe(-3.14);
        });

        it('should handle numbers with leading zeros in decimals', function () {
            const tokens = tokenizer.tokenize('0.5');
            expect(tokens[0].value).toBe(0.5);
        });
    });

    describe('Operator Tokens', function () {
        it('should tokenize addition operator', function () {
            const tokens = tokenizer.tokenize('+');
            expect(tokens[0].type).toBe(TokenType.OPERATOR);
            expect(tokens[0].value).toBe('+');
            expect(tokens[0].raw).toBe('+');
        });

        it('should tokenize all basic operators', function () {
            const input = '+-*/^';
            const tokens = tokenizer.tokenize(input);
            expect(tokens.length).toBe(6); // 5 operators + EOF

            const operators = ['+', '-', '*', '/', '^'];
            operators.forEach(function (op, i) {
                expect(tokens[i].type).toBe(TokenType.OPERATOR);
                expect(tokens[i].value).toBe(op);
            });
        });

        it('should differentiate minus operator from negative number', function () {
            const tokens = tokenizer.tokenize('5-3');
            expect(tokens.length).toBe(4); // NUMBER, OPERATOR, NUMBER, EOF
            expect(tokens[0].type).toBe(TokenType.NUMBER);
            expect(tokens[0].value).toBe(5);
            expect(tokens[1].type).toBe(TokenType.OPERATOR);
            expect(tokens[1].value).toBe('-');
            expect(tokens[2].type).toBe(TokenType.NUMBER);
            expect(tokens[2].value).toBe(3);
        });
    });

    describe('Logical Operator Tokens', function () {
        it('should tokenize single-character logical operators', function () {
            const tokens = tokenizer.tokenize('< > =');
            expect(tokens[0].type).toBe(TokenType.LOGICAL_OPERATOR);
            expect(tokens[0].value).toBe('<');
            expect(tokens[1].type).toBe(TokenType.LOGICAL_OPERATOR);
            expect(tokens[1].value).toBe('>');
            expect(tokens[2].type).toBe(TokenType.LOGICAL_OPERATOR);
            expect(tokens[2].value).toBe('=');
        });

        it('should tokenize two-character logical operators', function () {
            const tokens = tokenizer.tokenize('<=');
            expect(tokens[0].type).toBe(TokenType.LOGICAL_OPERATOR);
            expect(tokens[0].value).toBe('<=');
            expect(tokens[0].length).toBe(2);
        });

        it('should tokenize all two-character logical operators', function () {
            const input = '<= >= !=';
            const tokens = tokenizer.tokenize(input);
            expect(tokens[0].value).toBe('<=');
            expect(tokens[1].value).toBe('>=');
            expect(tokens[2].value).toBe('!=');
        });

        it('should throw error for standalone exclamation mark', function () {
            expect(function () {
                tokenizer.tokenize('!');
            }).toThrow();
        });
    });

    describe('Variable Tokens', function () {
        it('should tokenize single-character variables', function () {
            const tokens = tokenizer.tokenize('x');
            expect(tokens[0].type).toBe(TokenType.VARIABLE);
            expect(tokens[0].value).toBe('x');
            expect(tokens[0].raw).toBe('x');
        });

        it('should tokenize multi-character variables', function () {
            const tokens = tokenizer.tokenize('myVar');
            expect(tokens[0].type).toBe(TokenType.VARIABLE);
            expect(tokens[0].value).toBe('myVar');
            expect(tokens[0].raw).toBe('myVar');
        });

        it('should tokenize variables with underscores', function () {
            const tokens = tokenizer.tokenize('my_var');
            expect(tokens[0].value).toBe('my_var');
        });

        it('should tokenize variables with dots', function () {
            const tokens = tokenizer.tokenize('obj.prop');
            expect(tokens[0].value).toBe('obj.prop');
        });

        it('should tokenize bracketed variables', function () {
            const tokens = tokenizer.tokenize('[myVar]');
            expect(tokens[0].type).toBe(TokenType.VARIABLE);
            expect(tokens[0].value).toBe('myVar');
            expect(tokens[0].raw).toBe('[myVar]');
        });

        it('should tokenize bracketed variables with dots', function () {
            const tokens = tokenizer.tokenize('[obj.prop]');
            expect(tokens[0].value).toBe('obj.prop');
            expect(tokens[0].raw).toBe('[obj.prop]');
        });

        it('should throw error for unclosed bracketed variable', function () {
            expect(function () {
                tokenizer.tokenize('[myVar');
            }).toThrow();
        });

        it('should throw error for empty bracketed variable', function () {
            expect(function () {
                tokenizer.tokenize('[]');
            }).toThrow();
        });

        it('should throw error for invalid characters in bracketed variable', function () {
            expect(function () {
                tokenizer.tokenize('[my-var]');
            }).toThrow();
        });

        it('should tokenize math constants as variables', function () {
            const tokens = tokenizer.tokenize('PI E');
            expect(tokens[0].type).toBe(TokenType.VARIABLE);
            expect(tokens[0].value).toBe('PI');
            expect(tokens[1].type).toBe(TokenType.VARIABLE);
            expect(tokens[1].value).toBe('E');
        });
    });

    describe('Function Tokens', function () {
        it('should tokenize function names', function () {
            const tokens = tokenizer.tokenize('sin(');
            expect(tokens[0].type).toBe(TokenType.FUNCTION);
            expect(tokens[0].value).toBe('sin');
            expect(tokens[0].raw).toBe('sin');
            expect(tokens[1].type).toBe(TokenType.LEFT_PAREN);
        });

        it('should differentiate functions from variables by lookahead', function () {
            const tokens1 = tokenizer.tokenize('sin(x)');
            expect(tokens1[0].type).toBe(TokenType.FUNCTION);

            const tokens2 = tokenizer.tokenize('sin');
            expect(tokens2[0].type).toBe(TokenType.VARIABLE);
        });

        it('should tokenize function with whitespace before parenthesis', function () {
            const tokens = tokenizer.tokenize('sin (x)');
            expect(tokens[0].type).toBe(TokenType.FUNCTION);
        });

        it('should tokenize multi-character function names', function () {
            const tokens = tokenizer.tokenize('ifElse(');
            expect(tokens[0].type).toBe(TokenType.FUNCTION);
            expect(tokens[0].value).toBe('ifElse');
        });

        it('should tokenize functions with underscores', function () {
            const tokens = tokenizer.tokenize('my_func(');
            expect(tokens[0].type).toBe(TokenType.FUNCTION);
            expect(tokens[0].value).toBe('my_func');
        });

        it('should tokenize functions with dots', function () {
            const tokens = tokenizer.tokenize('Math.pow(');
            expect(tokens[0].type).toBe(TokenType.FUNCTION);
            expect(tokens[0].value).toBe('Math.pow');
        });
    });

    describe('String Tokens', function () {
        it('should tokenize double-quoted strings', function () {
            const tokens = tokenizer.tokenize('"hello"');
            expect(tokens[0].type).toBe(TokenType.STRING);
            expect(tokens[0].value).toBe('hello');
            expect(tokens[0].raw).toBe('"hello"');
        });

        it('should tokenize single-quoted strings', function () {
            const tokens = tokenizer.tokenize("'world'");
            expect(tokens[0].type).toBe(TokenType.STRING);
            expect(tokens[0].value).toBe('world');
            expect(tokens[0].raw).toBe("'world'");
        });

        it('should preserve whitespace in strings', function () {
            const tokens = tokenizer.tokenize('"hello world"');
            expect(tokens[0].value).toBe('hello world');
        });

        it('should handle escaped double quotes', function () {
            const tokens = tokenizer.tokenize('"say \\"hello\\""');
            expect(tokens[0].value).toBe('say "hello"');
            expect(tokens[0].raw).toBe('"say \\"hello\\""');
        });

        it('should handle escaped single quotes', function () {
            const tokens = tokenizer.tokenize("'it\\'s'");
            expect(tokens[0].value).toBe("it's");
        });

        it('should handle escaped backslashes', function () {
            const tokens = tokenizer.tokenize('"path\\\\file"');
            expect(tokens[0].value).toBe('path\\file');
        });

        it('should throw error for unterminated string', function () {
            expect(function () {
                tokenizer.tokenize('"hello');
            }).toThrow();
        });

        it('should handle empty strings', function () {
            const tokens = tokenizer.tokenize('""');
            expect(tokens[0].value).toBe('');
            expect(tokens[0].type).toBe(TokenType.STRING);
        });
    });

    describe('Parenthesis and Comma Tokens', function () {
        it('should tokenize left parenthesis', function () {
            const tokens = tokenizer.tokenize('(');
            expect(tokens[0].type).toBe(TokenType.LEFT_PAREN);
            expect(tokens[0].value).toBe('(');
        });

        it('should tokenize right parenthesis', function () {
            const tokens = tokenizer.tokenize(')');
            expect(tokens[0].type).toBe(TokenType.RIGHT_PAREN);
        });

        it('should tokenize comma', function () {
            const tokens = tokenizer.tokenize(',');
            expect(tokens[0].type).toBe(TokenType.COMMA);
            expect(tokens[0].value).toBe(',');
        });

        it('should tokenize matching parentheses', function () {
            const tokens = tokenizer.tokenize('()');
            expect(tokens[0].type).toBe(TokenType.LEFT_PAREN);
            expect(tokens[1].type).toBe(TokenType.RIGHT_PAREN);
        });
    });

    describe('Complex Expressions', function () {
        it('should tokenize simple arithmetic expression', function () {
            const tokens = tokenizer.tokenize('2+3');
            expect(tokens.length).toBe(4); // NUMBER, OPERATOR, NUMBER, EOF
            expect(tokens[0].value).toBe(2);
            expect(tokens[1].value).toBe('+');
            expect(tokens[2].value).toBe(3);
        });

        it('should tokenize expression with variables', function () {
            const tokens = tokenizer.tokenize('2*x+3*y');
            expect(tokens.length).toBe(8); // 2, *, x, +, 3, *, y, EOF
            expect(tokens[0].value).toBe(2);
            expect(tokens[1].value).toBe('*');
            expect(tokens[2].value).toBe('x');
            expect(tokens[3].value).toBe('+');
            expect(tokens[4].value).toBe(3);
            expect(tokens[5].value).toBe('*');
            expect(tokens[6].value).toBe('y');
        });

        it('should tokenize expression with function call', function () {
            const tokens = tokenizer.tokenize('sin(PI*x)');
            expect(tokens[0].type).toBe(TokenType.FUNCTION);
            expect(tokens[0].value).toBe('sin');
            expect(tokens[1].type).toBe(TokenType.LEFT_PAREN);
            expect(tokens[2].type).toBe(TokenType.VARIABLE);
            expect(tokens[2].value).toBe('PI');
            expect(tokens[3].type).toBe(TokenType.OPERATOR);
            expect(tokens[4].type).toBe(TokenType.VARIABLE);
            expect(tokens[5].type).toBe(TokenType.RIGHT_PAREN);
        });

        it('should tokenize nested function calls', function () {
            const tokens = tokenizer.tokenize('pow(sin(x),2)');
            expect(tokens[0].value).toBe('pow');
            expect(tokens[1].type).toBe(TokenType.LEFT_PAREN);
            expect(tokens[2].value).toBe('sin');
            expect(tokens[3].type).toBe(TokenType.LEFT_PAREN);
            expect(tokens[4].value).toBe('x');
            expect(tokens[5].type).toBe(TokenType.RIGHT_PAREN);
            expect(tokens[6].type).toBe(TokenType.COMMA);
            expect(tokens[7].value).toBe(2);
            expect(tokens[8].type).toBe(TokenType.RIGHT_PAREN);
        });

        it('should handle negative numbers in expressions correctly', function () {
            // 4*-5 should be: 4, *, -5
            const tokens = tokenizer.tokenize('4*-5');
            expect(tokens.length).toBe(4); // NUMBER, OPERATOR, NUMBER, EOF
            expect(tokens[0].value).toBe(4);
            expect(tokens[1].value).toBe('*');
            expect(tokens[2].value).toBe(-5);
        });

        it('should handle double minus correctly', function () {
            // 4--5 should be: 4, -, -5
            const tokens = tokenizer.tokenize('4--5');
            expect(tokens.length).toBe(4);
            expect(tokens[0].value).toBe(4);
            expect(tokens[1].value).toBe('-');
            expect(tokens[2].value).toBe(-5);
        });

        it('should handle parenthesized negative numbers', function () {
            const tokens = tokenizer.tokenize('(-5)');
            expect(tokens[0].type).toBe(TokenType.LEFT_PAREN);
            expect(tokens[1].type).toBe(TokenType.NUMBER);
            expect(tokens[1].value).toBe(-5);
            expect(tokens[2].type).toBe(TokenType.RIGHT_PAREN);
        });

        it('should tokenize complex expression with all token types', function () {
            const tokens = tokenizer.tokenize('ifElse(x>5,"big",y*2)');
            expect(tokens[0].type).toBe(TokenType.FUNCTION);
            expect(tokens[0].value).toBe('ifElse');
            expect(tokens[2].type).toBe(TokenType.VARIABLE);
            expect(tokens[2].value).toBe('x');
            expect(tokens[3].type).toBe(TokenType.LOGICAL_OPERATOR);
            expect(tokens[3].value).toBe('>');
            expect(tokens[4].type).toBe(TokenType.NUMBER);
            expect(tokens[4].value).toBe(5);
            expect(tokens[6].type).toBe(TokenType.STRING);
            expect(tokens[6].value).toBe('big');
        });
    });

    describe('Whitespace Handling', function () {
        it('should skip leading whitespace', function () {
            const tokens = tokenizer.tokenize('   42');
            expect(tokens[0].position).toBe(3);
            expect(tokens[0].value).toBe(42);
        });

        it('should skip trailing whitespace', function () {
            const tokens = tokenizer.tokenize('42   ');
            expect(tokens.length).toBe(2); // NUMBER, EOF
        });

        it('should skip whitespace between tokens', function () {
            const tokens = tokenizer.tokenize('2  +  3');
            expect(tokens.length).toBe(4);
            expect(tokens[0].value).toBe(2);
            expect(tokens[1].value).toBe('+');
            expect(tokens[2].value).toBe(3);
        });

        it('should handle tabs and newlines', function () {
            const tokens = tokenizer.tokenize('2\t+\n3');
            expect(tokens.length).toBe(4);
            expect(tokens[0].value).toBe(2);
            expect(tokens[1].value).toBe('+');
            expect(tokens[2].value).toBe(3);
        });
    });

    describe('Position Tracking', function () {
        it('should track token positions correctly', function () {
            const tokens = tokenizer.tokenize('2 + 3');
            expect(tokens[0].position).toBe(0); // '2' at position 0
            expect(tokens[1].position).toBe(2); // '+' at position 2
            expect(tokens[2].position).toBe(4); // '3' at position 4
        });

        it('should track token lengths correctly', function () {
            const tokens = tokenizer.tokenize('myVar');
            expect(tokens[0].length).toBe(5);
        });

        it('should track positions in complex expressions', function () {
            const tokens = tokenizer.tokenize('sin(x)');
            expect(tokens[0].position).toBe(0); // 'sin'
            expect(tokens[0].length).toBe(3);
            expect(tokens[1].position).toBe(3); // '('
            expect(tokens[2].position).toBe(4); // 'x'
            expect(tokens[3].position).toBe(5); // ')'
        });
    });

    describe('Error Cases', function () {
        it('should throw error for unexpected characters', function () {
            expect(function () {
                tokenizer.tokenize('@');
            }).toThrow();
        });

        it('should throw error for hash symbol', function () {
            expect(function () {
                tokenizer.tokenize('#');
            }).toThrow();
        });

        it('should provide position in error messages', function () {
            try {
                tokenizer.tokenize('2 + @');
                fail('Should have thrown an error');
            } catch (e) {
                expect(e.message).toContain('position 4');
            }
        });
    });

    describe('EOF Token', function () {
        it('should always end with EOF token', function () {
            const tokens = tokenizer.tokenize('42');
            expect(tokens[tokens.length - 1].type).toBe(TokenType.EOF);
        });

        it('should include EOF for empty input', function () {
            const tokens = tokenizer.tokenize('');
            expect(tokens.length).toBe(1);
            expect(tokens[0].type).toBe(TokenType.EOF);
        });

        it('should have EOF at correct position', function () {
            const input = '42';
            const tokens = tokenizer.tokenize(input);
            expect(tokens[tokens.length - 1].position).toBe(input.length);
        });
    });

    describe('Edge Cases', function () {
        it('should handle empty input', function () {
            const tokens = tokenizer.tokenize('');
            expect(tokens.length).toBe(1);
            expect(tokens[0].type).toBe(TokenType.EOF);
        });

        it('should handle only whitespace', function () {
            const tokens = tokenizer.tokenize('   ');
            expect(tokens.length).toBe(1);
            expect(tokens[0].type).toBe(TokenType.EOF);
        });

        it('should handle function call with no arguments', function () {
            const tokens = tokenizer.tokenize('rand()');
            expect(tokens[0].type).toBe(TokenType.FUNCTION);
            expect(tokens[1].type).toBe(TokenType.LEFT_PAREN);
            expect(tokens[2].type).toBe(TokenType.RIGHT_PAREN);
        });

        it('should handle multiple commas in function call', function () {
            const tokens = tokenizer.tokenize('func(a,b,c)');
            expect(tokens[2].type).toBe(TokenType.VARIABLE);
            expect(tokens[3].type).toBe(TokenType.COMMA);
            expect(tokens[4].type).toBe(TokenType.VARIABLE);
            expect(tokens[5].type).toBe(TokenType.COMMA);
            expect(tokens[6].type).toBe(TokenType.VARIABLE);
        });
    });
});
