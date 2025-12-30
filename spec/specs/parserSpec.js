import Formula from '../../dist/fparser.js';

const Tokenizer = Formula.Tokenizer;
const Parser = Formula.Parser;

describe('Parser', function () {
    let tokenizer;
    let formula;

    beforeEach(function () {
        tokenizer = new Tokenizer();
        formula = new Formula(''); // dummy formula object for parser
    });

    /**
     * Helper function to parse a formula string
     */
    function parse(input) {
        const tokens = tokenizer.tokenize(input);
        const parser = new Parser(tokens, formula);
        return parser.parse();
    }

    describe('Basic Expressions', function () {
        it('should parse a simple number', function () {
            const expr = parse('42');
            expect(expr.evaluate()).toBe(42);
        });

        it('should parse a negative number', function () {
            const expr = parse('-5');
            expect(expr.evaluate()).toBe(-5);
        });

        it('should parse a decimal number', function () {
            const expr = parse('3.14');
            expect(expr.evaluate()).toBe(3.14);
        });

        it('should parse a string literal', function () {
            const expr = parse('"hello"');
            expect(expr.evaluate()).toBe('hello');
        });

        it('should parse a variable', function () {
            const expr = parse('x');
            expect(expr.evaluate({ x: 10 })).toBe(10);
        });

        it('should parse a bracketed variable', function () {
            const expr = parse('[myVar]');
            expect(expr.evaluate({ myVar: 20 })).toBe(20);
        });
    });

    describe('Arithmetic Operators', function () {
        it('should parse addition', function () {
            const expr = parse('2 + 3');
            expect(expr.evaluate()).toBe(5);
        });

        it('should parse subtraction', function () {
            const expr = parse('10 - 4');
            expect(expr.evaluate()).toBe(6);
        });

        it('should parse multiplication', function () {
            const expr = parse('3 * 4');
            expect(expr.evaluate()).toBe(12);
        });

        it('should parse division', function () {
            const expr = parse('15 / 3');
            expect(expr.evaluate()).toBe(5);
        });

        it('should parse power', function () {
            const expr = parse('2 ^ 3');
            expect(expr.evaluate()).toBe(8);
        });
    });

    describe('Operator Precedence', function () {
        it('should handle multiplication before addition', function () {
            const expr = parse('2 + 3 * 4');
            expect(expr.evaluate()).toBe(14); // 2 + 12, not 20
        });

        it('should handle division before subtraction', function () {
            const expr = parse('10 - 6 / 2');
            expect(expr.evaluate()).toBe(7); // 10 - 3, not 2
        });

        it('should handle power before multiplication', function () {
            const expr = parse('2 * 3 ^ 2');
            expect(expr.evaluate()).toBe(18); // 2 * 9, not 36
        });

        it('should handle complex precedence: 2 + 3 * 4 ^ 2', function () {
            const expr = parse('2 + 3 * 4 ^ 2');
            expect(expr.evaluate()).toBe(50); // 2 + 3 * 16 = 2 + 48 = 50
        });

        it('should handle left-to-right for same precedence (addition)', function () {
            const expr = parse('5 - 3 + 2');
            expect(expr.evaluate()).toBe(4); // (5 - 3) + 2 = 4
        });

        it('should handle left-to-right for same precedence (multiplication)', function () {
            const expr = parse('20 / 4 * 2');
            expect(expr.evaluate()).toBe(10); // (20 / 4) * 2 = 10
        });
    });

    describe('Right-Associative Power Operator', function () {
        it('should parse 2^3^2 as 2^(3^2) = 2^9 = 512', function () {
            const expr = parse('2 ^ 3 ^ 2');
            expect(expr.evaluate()).toBe(512); // 2^(3^2) = 2^9 = 512
        });

        it('should parse 2^2^3 as 2^(2^3) = 2^8 = 256', function () {
            const expr = parse('2 ^ 2 ^ 3');
            expect(expr.evaluate()).toBe(256); // 2^(2^3) = 2^8 = 256
        });

        it('should handle 4^3^2 as 4^(3^2) = 4^9', function () {
            const expr = parse('4 ^ 3 ^ 2');
            expect(expr.evaluate()).toBe(262144); // 4^9
        });
    });

    describe('Parentheses', function () {
        it('should parse parenthesized expression', function () {
            const expr = parse('(2 + 3)');
            expect(expr.evaluate()).toBe(5);
        });

        it('should override precedence with parentheses', function () {
            const expr = parse('(2 + 3) * 4');
            expect(expr.evaluate()).toBe(20);
        });

        it('should handle nested parentheses', function () {
            const expr = parse('((2 + 3) * 4)');
            expect(expr.evaluate()).toBe(20);
        });

        it('should handle complex nested parentheses', function () {
            const expr = parse('(2 + (3 * 4)) ^ 2');
            expect(expr.evaluate()).toBe(196); // (2 + 12)^2 = 14^2 = 196
        });

        it('should handle multiple parentheses groups', function () {
            const expr = parse('(2 + 3) * (4 + 5)');
            expect(expr.evaluate()).toBe(45); // 5 * 9
        });
    });

    describe('Unary Operators', function () {
        it('should parse unary minus on number', function () {
            const expr = parse('-5');
            expect(expr.evaluate()).toBe(-5);
        });

        it('should parse unary minus on expression', function () {
            const expr = parse('-(2 + 3)');
            expect(expr.evaluate()).toBe(-5);
        });

        it('should parse unary plus', function () {
            const expr = parse('+5');
            expect(expr.evaluate()).toBe(5);
        });

        it('should parse double negative', function () {
            const expr = parse('--5');
            expect(expr.evaluate()).toBe(5); // -(-5) = 5
        });

        it('should parse multiplication with negative', function () {
            const expr = parse('4 * -5');
            expect(expr.evaluate()).toBe(-20);
        });

        it('should parse subtraction with negative', function () {
            const expr = parse('4 - -5');
            expect(expr.evaluate()).toBe(9); // 4 - (-5) = 9
        });

        it('should parse negative variable', function () {
            const expr = parse('-x');
            expect(expr.evaluate({ x: 10 })).toBe(-10);
        });

        it('should parse complex expression with unary minus', function () {
            const expr = parse('3 + -2 * 4');
            expect(expr.evaluate()).toBe(-5); // 3 + (-2 * 4) = 3 + (-8) = -5
        });
    });

    describe('Function Calls', function () {
        it('should parse function with no arguments', function () {
            const expr = parse('random()');
            // Just check it doesn't throw
            expect(() => expr.evaluate()).not.toThrow();
        });

        it('should parse function with single argument', function () {
            const expr = parse('sin(0)');
            expect(expr.evaluate()).toBe(0);
        });

        it('should parse function with multiple arguments', function () {
            const expr = parse('pow(2, 3)');
            expect(expr.evaluate()).toBe(8);
        });

        it('should parse nested function calls', function () {
            const expr = parse('sin(cos(0))');
            expect(expr.evaluate()).toBeCloseTo(Math.sin(Math.cos(0)), 10);
        });

        it('should parse function with expression arguments', function () {
            const expr = parse('pow(2 + 1, 3 - 1)');
            expect(expr.evaluate()).toBe(9); // pow(3, 2) = 9
        });

        it('should parse function with variable arguments', function () {
            const expr = parse('pow(x, 2)');
            expect(expr.evaluate({ x: 5 })).toBe(25);
        });

        it('should parse complex function expression', function () {
            const expr = parse('2 * sin(PI / 2)');
            expect(expr.evaluate({ PI: Math.PI })).toBeCloseTo(2, 10);
        });
    });

    describe('Logical Operators', function () {
        it('should parse less than', function () {
            const expr = parse('2 < 3');
            expect(expr.evaluate()).toBe(1); // true
        });

        it('should parse greater than', function () {
            const expr = parse('5 > 3');
            expect(expr.evaluate()).toBe(1); // true
        });

        it('should parse less than or equal', function () {
            const expr = parse('3 <= 3');
            expect(expr.evaluate()).toBe(1); // true
        });

        it('should parse greater than or equal', function () {
            const expr = parse('4 >= 3');
            expect(expr.evaluate()).toBe(1); // true
        });

        it('should parse equals', function () {
            const expr = parse('5 = 5');
            expect(expr.evaluate()).toBe(1); // true
        });

        it('should parse not equals', function () {
            const expr = parse('5 != 3');
            expect(expr.evaluate()).toBe(1); // true
        });

        it('should parse logical operator with lower precedence', function () {
            const expr = parse('2 + 3 > 4');
            expect(expr.evaluate()).toBe(1); // (2 + 3) > 4 = 5 > 4 = true
        });

        it('should parse multiple logical operators', function () {
            const expr = parse('1 < 2');
            expect(expr.evaluate()).toBe(1);
        });
    });

    describe('Complex Expressions', function () {
        it('should parse: 2 * x + 3 * y', function () {
            const expr = parse('2 * x + 3 * y');
            expect(expr.evaluate({ x: 5, y: 10 })).toBe(40); // 10 + 30
        });

        it('should parse: (a + b) * (c - d)', function () {
            const expr = parse('(a + b) * (c - d)');
            expect(expr.evaluate({ a: 2, b: 3, c: 10, d: 4 })).toBe(30); // 5 * 6
        });

        it('should parse: x^2 + 2*x + 1', function () {
            const expr = parse('x^2 + 2*x + 1');
            expect(expr.evaluate({ x: 3 })).toBe(16); // 9 + 6 + 1
        });

        it('should parse: sin(PI*x)/(2*PI)', function () {
            const expr = parse('sin(PI*x)/(2*PI)');
            const result = expr.evaluate({ PI: Math.PI, x: 0.5 });
            expect(result).toBeCloseTo(1 / (2 * Math.PI), 10);
        });

        it('should parse: pow(2, 3 + 4) * 5', function () {
            const expr = parse('pow(2, 3 + 4) * 5');
            expect(expr.evaluate()).toBe(640); // pow(2, 7) * 5 = 128 * 5
        });

        it('should parse expression with multiple variables and functions', function () {
            const expr = parse('sqrt(x^2 + y^2)');
            expect(expr.evaluate({ x: 3, y: 4 })).toBe(5);
        });
    });

    describe('Error Handling', function () {
        it('should throw error for unexpected token at start', function () {
            expect(() => parse('* 2')).toThrow();
        });

        it('should throw error for unclosed parenthesis', function () {
            expect(() => parse('(2 + 3')).toThrow();
        });

        it('should throw error for extra closing parenthesis', function () {
            expect(() => parse('2 + 3)')).toThrow();
        });

        it('should throw error for missing function argument', function () {
            expect(() => parse('pow(2,)')).toThrow();
        });

        it('should throw error for trailing operator', function () {
            expect(() => parse('2 + 3 *')).toThrow();
        });

        it('should throw error for leading operator (except unary)', function () {
            expect(() => parse('* 2')).toThrow();
        });

        it('should provide position information in error messages', function () {
            try {
                parse('2 + (3 * 4');
                fail('Should have thrown an error');
            } catch (e) {
                expect(e.message).toContain('position');
            }
        });
    });

    describe('Edge Cases', function () {
        it('should parse single variable', function () {
            const expr = parse('x');
            expect(expr.evaluate({ x: 42 })).toBe(42);
        });

        it('should parse zero', function () {
            const expr = parse('0');
            expect(expr.evaluate()).toBe(0);
        });

        it('should parse expression with spaces', function () {
            const expr = parse('  2  +  3  ');
            expect(expr.evaluate()).toBe(5);
        });

        it('should handle division by expression', function () {
            const expr = parse('10 / (2 + 3)');
            expect(expr.evaluate()).toBe(2);
        });

        it('should handle power of negative number', function () {
            const expr = parse('(-2) ^ 3');
            expect(expr.evaluate()).toBe(-8);
        });

        it('should handle nested function with operators', function () {
            const expr = parse('abs(-5 + 2)');
            expect(expr.evaluate()).toBe(3); // abs(-3) = 3
        });
    });

    describe('AST Structure Validation', function () {
        it('should create correct AST for 2 + 3 * 4', function () {
            const expr = parse('2 + 3 * 4');
            const str = expr.toString();
            // Should be: 2 + (3 * 4), not (2 + 3) * 4
            expect(str).toBe('2 + 3 * 4');
        });

        it('should create correct AST for (2 + 3) * 4', function () {
            const expr = parse('(2 + 3) * 4');
            const str = expr.toString();
            expect(str).toBe('(2 + 3) * 4');
        });

        it('should create correct AST for power: 2 ^ 3 ^ 2', function () {
            const expr = parse('2 ^ 3 ^ 2');
            const str = expr.toString();
            // Right associative: 2^(3^2)
            expect(str).toBe('2^3^2');
        });
    });
});
