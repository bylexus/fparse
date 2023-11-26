import Fparser from '../../dist/fparser.js';

describe('Basic tests', function () {
    it('can be required as a node module', function () {
        expect(Fparser).toBeDefined();
    });

    it('parses a simple formula without variables', function () {
        const f = new Fparser('10 -4  *2 + 8');
        const res = f.evaluate();
        expect(res).toEqual(10);
    });

    it('can evaluate multiple inputs at once', function () {
        const f = new Fparser('x^2');
        const res = f.evaluate([{ x: 0 }, { x: 1 }, { x: 2 }]);
        expect(res).toEqual([0, 1, 4]);
    });

    it('parses a formula with variables, expects values for each', function () {
        const f = new Fparser('10 -x  *2 + y');

        expect(function () {
            f.evaluate();
        }).toThrowError(/Cannot evaluate x/);
        expect(function () {
            f.evaluate({ x: 3 });
        }).toThrowError(/Cannot evaluate y/);

        const res = f.evaluate({ x: 3, y: 5 });
        expect(res).toEqual(9);
    });

    it('throws a syntax error when parsing failed', function () {
        expect(() => new Fparser('10+')).toThrowError(/Syntax error/);
        expect(() => new Fparser('-3*4^')).toThrowError(/Syntax error/);
        expect(() => new Fparser('4*5+++')).toThrowError(/Syntax error/);
        expect(() => new Fparser('4***5')).toThrowError(/Syntax error/);
        expect(() => new Fparser('+4+5')).toThrowError(/Wrong operator position/);
        expect(() => new Fparser('4+5*sin(pi')).toThrowError(/Syntax error/);
        expect(() => new Fparser('4+5*sin)pi)')).toThrowError(/Wrong character for function/);
    });

    it('parses parenthesis correctly', function () {
        const f = new Fparser('4*(2+8/(3.0+2.0))');
        expect(f.evaluate()).toEqual(4 * (2 + 8 / (3.0 + 2.0)));
    });

    it('parses function names correctly', function () {
        let f = new Fparser('sin(3)');
        let exp = new Fparser.FunctionExpression('sin', [new Fparser.ValueExpression(3)]);
        exp.formulaObject = f;
        expect(f.getExpression()).toEqual(exp);

        f = new Fparser('sin_2(3)');
        exp = new Fparser.FunctionExpression('sin_2', [new Fparser.ValueExpression(3)]);
        exp.formulaObject = f;
        expect(f.getExpression()).toEqual(exp);

        f = new Fparser('Foo9(3)');
        exp = new Fparser.FunctionExpression('Foo9', [new Fparser.ValueExpression(3)]);
        exp.formulaObject = f;
        expect(f.getExpression()).toEqual(exp);

        f = new Fparser('F_o_O_0_3_(3)');
        exp = new Fparser.FunctionExpression('F_o_O_0_3_', [new Fparser.ValueExpression(3)]);
        exp.formulaObject = f;
        expect(f.getExpression()).toEqual(exp);
    });

    it('knows the Math constants and can parse them within a formula', function () {
        const constants = ['PI', 'E', 'LN2', 'LN10', 'LOG2E', 'LOG10E', 'SQRT1_2', 'SQRT2'];

        let f;
        constants.forEach(function (c) {
            f = new Fparser('3*' + c + ' + 5');
            expect(f.evaluate()).toEqual(3 * Math[c] + 5);
        });
    });

    it('can re-use the object with setFormula()', function () {
        const f = new Fparser('x+3');
        let res = f.evaluate({ x: 2 });
        expect(res).toEqual(5);

        f.setFormula('y+[foo]');
        res = f.evaluate({ y: 3, foo: 4 });
        expect(res).toEqual(7);
    });

    it('setFormula returns self', function () {
        const f = new Fparser();
        let res = f.setFormula('y+[foo]');
        expect(res === f).toBeTrue();
    });

    it('can use nested properties in a variable expression', () => {
        const f = new Fparser('[a] + [b.c] + [b.e.3]'); // 10 + 20 + 4
        expect(f.evaluate({ a: 10, b: { c: 20, d: 0, e: [1, 2, 3, 4] } })).toEqual(34);
    });
});
