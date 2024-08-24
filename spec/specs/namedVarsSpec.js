import Fparser from '../../dist/fparser.js';
describe('Named Variable tests', function () {
    it('knows the named variable [varname] syntax', function () {
        const provider = [
            ['3*[myvar]', { myvar: 5 }, 15],
            ['3*[myvar]-([othervar]+[myvar]*2)', { myvar: 5, othervar: 8 }, -3],
            ['pow(2,[my_Var_Name])', { my_Var_Name: 4 }, 16],
            ['[0_starts_with_0]*[0_starts_with_0]', { '0_starts_with_0': 3 }, 9]
        ];

        provider.forEach(function (testdata) {
            expect(Fparser.calc(testdata[0], testdata[1])).toEqual(testdata[2]);
        });
    });

    it('throws an error when named variable name contains invalid chars', function () {
        const provider = [['[my-var]', /Character not allowed/]];

        provider.forEach(function (testdata) {
            expect(function () {
                Fparser.calc(testdata[0]);
            }).toThrowError(testdata[1]);
        });
    });

    it('returns also named vars in getVariables() call', function () {
        const f = new Fparser('x*2+[var1]*[var2]');
        const variables = f.getVariables();
        expect(variables).toEqual(['x', 'var1', 'var2']);
    });

    it('can evaluate named vars and Math constants correctly', function () {
        const f = new Fparser('PI*[foo]+4E');
        const variables = f.getVariables();
        expect(variables).toEqual(['PI', 'foo', 'E']);
        expect(f.getExpressionString()).toEqual('PI * foo + 4 * E');
        expect(f.evaluate({ foo: 3 })).toEqual(Math.PI * 3 + 4 * Math.E);
    });

    it('replaces multiple occurences of math constants correctly', function () {
        const f = new Fparser('PI+E+PI+E');
        const variables = f.getVariables();
        expect(variables).toEqual(['PI', 'E']);
        expect(f.getExpressionString()).toEqual('PI + E + PI + E');
        expect(f.evaluate()).toEqual(Math.PI + Math.E + Math.PI + Math.E);
    });

    it('replaces path variables correctly', function () {
        const f = new Fparser('[a.b] + [a.c]');
        expect(f.evaluate({ a: { b: 1, c: 2 } })).toEqual(3);
    });

    it('replaces path variables with long names correctly', function () {
        const f = new Fparser('[alex.blex] + [a.clex] + [alex.d]');
        expect(
            f.evaluate({
                a: { b: 1, c: 2, clex: 5 },
                alex: { blex: 3, c: 4, d: 6 }
            })
        ).toEqual(3 + 5 + 6);
    });

    it('can access string props from path variables', function () {
        const f = new Fparser('[alex.blex.length]');
        expect(
            f.evaluate({
                alex: { blex: 'Alex' }
            })
        ).toEqual(4);
    });

    it('can access array props from path variables', function () {
        const f = new Fparser('[alex.blex.length]');
        expect(
            f.evaluate({
                alex: { blex: [1, 2, 3, 4] }
            })
        ).toEqual(4);
    });

    it('replaces path array variables correctly', function () {
        const f = new Fparser('[a.b.0] + [a.c.d.3]');
        expect(f.evaluate({ a: { b: [1, 2, 3], c: { d: [7, 8, 9, 10] } } })).toEqual(11);
    });

    it('finds variables in both value param and the Formula object', function () {
        // standard variable, as evaluate parameter:
        let f = new Fparser('[xa] + [yb]');
        expect(f.evaluate({ xa: 1, yb: 20 })).toEqual(21);

        // standard variable, as object parameter:
        f = new Fparser('[xa] + [yb]');
        f.xa = 1;
        f.yb = 20;
        expect(f.evaluate()).toEqual(21);

        // variable in object, as evaluate parameter:
        f = new Fparser('[obj.xa] + [obj.yb]');
        expect(f.evaluate({ obj: { xa: 1, yb: 20 } })).toEqual(21);

        // variable in object, as formula object parameter:
        f = new Fparser('[obj.xa] + [obj.yb]');
        f.obj = { xa: 1, yb: 20 };
        expect(f.evaluate()).toEqual(21);
    });

    it('Values throw an exception when used as functions', function () {
        const f = new Fparser('[a] + b');
        expect(function () {
            f.evaluate({ a: 1, b: () => 2 });
        }).toThrowError('');
    });

    it('Complex example with all types of variables mixed', function () {
        const f = new Fparser('3x^2+4*[xx] - 2*[obj.x] - 3*[obj.yy]');
        expect(
            f.evaluate({
                x: 1,
                xx: 2,
                obj: {
                    x: 3,
                    yy: 4
                }
            })
        ).toEqual(-7);

        const f2 = new Fparser('3x^2+4*[xx] - 2*[obj.x] - 3*[obj.yy]');
        f2.x = 1;
        f2.xx = 2;
        f2.obj = {
            x: 3,
            yy: 4
        };
        expect(f2.evaluate()).toEqual(-7);
    });
});
