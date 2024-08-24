import Formula from '../../dist/fparser.js';

describe('Demos from the readme', function () {
    it('using multiple variables', () => {
        const fObj = new Formula('a*x^2 + b*x + c');

        // Just pass a value object containing a value for each unknown variable:
        let result = fObj.evaluate({ a: 2, b: -1, c: 3, x: 3 }); // result = 18
        expect(result).toEqual(18);
    });

    it('Using named variables', () => {
        const fObj = new Formula('2*[var1] + sin([var2]+PI)');

        // Just pass a value object containing a value for each named variable:
        let result = fObj.evaluate({ var1: 5, var2: 0.7 });
        expect(result).toBeCloseTo(2 * 5 + Math.sin(0.7 + Math.PI), 6);
    });

    describe('Using named object path variables', () => {
        it('Example 1', () => {
            const fObj = new Formula('2*[var1.propertyA] + 3*[var2.propertyB.propertyC]');

            // Just pass a value object containing a value for each named variable:
            let result = fObj.evaluate({ var1: { propertyA: 3 }, var2: { propertyB: { propertyC: 9 } } });
            expect(result).toEqual(2 * 3 + 3 * 9);
        });
        it('Example 2', () => {
            // var2.propertyB is an array, so we can use an index for the 3rd entry of propertyB:
            const fObj = new Formula('2*[var1.propertyA] + 3*[var2.propertyB.2]');
            let result = fObj.evaluate({ var1: { propertyA: 3 }, var2: { propertyB: [2, 4, 6] } });
            expect(result).toEqual(2 * 3 + 3 * 6);
        });
    });

    describe('Using user-defined functions', () => {
        it('Example 1', () => {
            const fObj = new Formula('sin(inverse(x))');

            //Define the function(s) on the Formula object, then use it multiple times:
            fObj.inverse = (value) => 1 / value;
            let results = fObj.evaluate([{ x: 1 }, { x: 2 }, { x: 3 }]);
            expect(results).toEqual([Math.sin(fObj.inverse(1)), Math.sin(fObj.inverse(2)), Math.sin(fObj.inverse(3))]);

            // Or pass it in the value object, and OVERRIDE an existing function:
            let result = fObj.evaluate({
                x: 2 / Math.PI,
                inverse: (value) => -1 * value
            });
            expect(result).toEqual(Math.sin(-1 * (2 / Math.PI)));
        });

        it('Example 2', () => {
            // in an evaluate() value object:
            const fObj = new Formula('sin(lib.inverse([lib.x]))');
            let res = fObj.evaluate({
                lib: { inverse: (value) => 1 / value, x: Math.PI }
            });
            expect(res).toEqual(Math.sin(1 / Math.PI));

            // or set it on the Formula instance:
            const fObj2 = new Formula('sin(lib.inverse(x))');
            fObj2.lib = { inverse: (value) => 1 / value };
            const res2 = fObj2.evaluate({ x: Math.PI });
            expect(res2).toEqual(Math.sin(1 / Math.PI));
        });
    });

    describe('Using strings', () => {
        it('Example 1', () => {
            const fObj = new Formula('concat([var1], "Bar")');
            let result = fObj.evaluate({ var1: 'Foo', concat: (s1, s2) => s1 + s2 });
            expect(result).toEqual('FooBar');
        });

        it('Example 2', () => {
            const fObj = new Formula('20 - longer([var1], "Bar")');
            let result = fObj.evaluate({
                var1: 'FooBar',
                longer: (s1, s2) => (s1.length > s2.length ? s1.length : s2.length)
            });
            expect(result).toEqual(14);
        });
    });

    describe('Using logical operators', () => {
        it('Example 1', () => {
            const fObj = new Formula('(x >= 0) * (x <= 1) * x * 100');
            let result = fObj.evaluate([{ x: 0.5 }, { x: 0.7 }, { x: 1.5 }, { x: -0.5 }, { x: -1.7 }]);
            expect(result).toEqual([50, 70, 0, -0, -0]);
        });

        it('Example 2', () => {
            const fObj = new Formula('withinOne(x) * 100');
            fObj.withinOne = (x) => (x >= 0 && x <= 1 ? x : 0);
            let result = fObj.evaluate([{ x: 0.5 }, { x: 0.7 }, { x: 1.5 }, { x: -0.5 }, { x: -1.7 }]);
            expect(result).toEqual([50, 70, 0, 0, 0]);
        });
    });

    describe('Conditional evaluation', () => {
        it('Example 1', () => {
            const fObj = new Formula('ifElse([age] < 18, [price]*0.5, [price])');
            const res = fObj.evaluate([
                { price: 100, age: 17 },
                { price: 100, age: 20 }
            ]);
            expect(res).toEqual([50, 100]);
        });
    });

    describe('Re-use a Formula object', () => {
        it('Example 1', () => {
            const fObj = new Formula();
            // ...
            fObj.setFormula('2*x^2 + 5*x + 3');
            let res = fObj.evaluate({ x: 3 });
            expect(res).toEqual(2 * Math.pow(3, 2) + 5 * 3 + 3);
            // ...
            fObj.setFormula('x*y');
            res = fObj.evaluate({ x: 2, y: 4 });
            expect(res).toEqual(2 * 4);
        });
    });

    describe('Memoization', () => {
        it('Example 1', () => {
            const fObj = new Formula('x * y', { memoization: true });
            let res1 = fObj.evaluate({ x: 2, y: 3 }); // 6, evaluated by calculating x*y
            expect(res1).toEqual(2 * 3);
            let res2 = fObj.evaluate({ x: 2, y: 3 }); // 6, from memory
            expect(res2).toEqual(2 * 3);
        });
    });

    describe('Blacklisted Functions', () => {
        it('Example 1', () => {
            // Internal functions cannot be used in formulas:
            let fObj = new Formula('evaluate(x)');
            expect(() => fObj.evaluate({ x: 5 })).toThrow();

            // This also counts for function aliases / references to internal functions:
            fObj = new Formula('ex(x)');
            fObj.ex = fObj.evaluate;
            expect(() => fObj.evaluate({ x: 5 })).toThrow();
        });
    });

    describe('Get all used variables', () => {
        it('Example 1', () => {
            // Get all used variables in the order of their appearance:
            const f4 = new Formula('x*sin(PI*y) + y / (2-x*[var1]) + [var2]');
            let res = f4.getVariables();
            expect(res).toEqual(['x', 'PI', 'y', 'var1', 'var2']);
        });
    });

    describe('Get the parsed formula string', () => {
        it('Example 1', () => {
            // Get all used variables in the order of their appearance:
            const f = new Formula('x      * (  y  +    9 )');
            let res = f.getExpressionString();
            expect(res).toEqual('x * (y + 9)');
        });
    });

    describe('Pre-defined functions', () => {
        describe('ifElse', () => {
            it('Example 1', () => {
                const fObj = new Formula('ifElse([age] < 18, [price]*0.5, [price])');
                let res = fObj.evaluate({ age: 17, price: 100 });
                expect(res).toEqual(50);
            });

            it('Example 1', () => {
                const fObj = new Formula(`
                    ifElse([person.age] < 18, 
                      ifElse(schoolNames.includes([person.school]), 
                          [price]*0.5, 
                          [price]
                      ),
                      [price]
                    )
                `);
                let res = fObj.evaluate({
                    person: { age: 17, school: 'ABC Primary' },
                    price: 100,
                    schoolNames: ['Local First', 'ABC Primary', 'Middleton High']
                });
                expect(res).toEqual(50);
            });
        });
    });
});
