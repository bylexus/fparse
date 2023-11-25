import Fparser from '../../dist/fparser.js';

describe('Expression tests', function () {
    describe('Expression', () => {
        it('evaluate() cannot be called on Expression', () => {
            let inst = new Fparser.Expression();
            expect(() => inst.evaluate({})).toThrowError('Empty Expression - Must be defined in child classes');
        });
        describe('createOperatorExpression', () => {
            it('returns the correct Expression instance for a given operator', () => {
                let inst = Fparser.Expression.createOperatorExpression('^');
                expect(inst).toBeInstanceOf(Fparser.PowerExpression);

                inst = Fparser.Expression.createOperatorExpression('-');
                expect(inst).toBeInstanceOf(Fparser.PlusMinusExpression);

                inst = Fparser.Expression.createOperatorExpression('+');
                expect(inst).toBeInstanceOf(Fparser.PlusMinusExpression);

                inst = Fparser.Expression.createOperatorExpression('*');
                expect(inst).toBeInstanceOf(Fparser.MultDivExpression);

                inst = Fparser.Expression.createOperatorExpression('/');
                expect(inst).toBeInstanceOf(Fparser.MultDivExpression);

                expect(() => Fparser.Expression.createOperatorExpression('%')).toThrowError('Unknown operator: %');
            });
        });
    });

    describe('ValueExpression', () => {
        it('just returns its configured value, as number', () => {
            let inst = null;
            let params = { x: 4 };
            let res = null;
            let tests = [
                [42, 42],
                ['42', 42],
                ['', 0],
                [-42, -42],
                ['-42', -42],
                [3.14, 3.14],
                ['3.14', 3.14],
                [null, 0],
                [undefined, NaN, true]
            ];

            tests.forEach((item) => {
                if (item.length < 3) {
                    inst = new Fparser.ValueExpression(item[0]);
                    res = inst.evaluate(params);
                    expect(res).toEqual(item[1]);
                } else {
                    expect(() => {
                        inst = new Fparser.ValueExpression(item[0]);
                    }).toThrow();
                }
            });
        });
    });

    describe('PlusMinusExpression', () => {
        it('is instantiated correctly', () => {
            let inst = null;

            inst = new Fparser.PlusMinusExpression('+');
            expect(inst.operator).toBe('+');
            inst = new Fparser.PlusMinusExpression('+', new Fparser.ValueExpression(3), new Fparser.ValueExpression(4));
            expect(inst.operator).toBe('+');
            expect(inst.left.value).toBe(3);
            expect(inst.right.value).toBe(4);

            inst = new Fparser.PlusMinusExpression('-');
            expect(inst.operator).toBe('-');
            inst = new Fparser.PlusMinusExpression('-', new Fparser.ValueExpression(3), new Fparser.ValueExpression(4));
            expect(inst.operator).toBe('-');
            expect(inst.left.value).toBe(3);
            expect(inst.right.value).toBe(4);

            expect(() => {
                inst = new Fparser.PlusMinusExpression('*');
            }).toThrow();
        });
        it('evaluates correctly', () => {
            let inst = null;

            inst = new Fparser.PlusMinusExpression(
                '+',
                new Fparser.ValueExpression(42),
                new Fparser.VariableExpression('x')
            );
            let res = inst.evaluate({ x: -24 });
            expect(res).toEqual(18);
        });
    });

    describe('MultDivExpression', () => {
        it('is instantiated correctly', () => {
            let inst = null;

            inst = new Fparser.MultDivExpression('*');
            expect(inst.operator).toBe('*');
            inst = new Fparser.MultDivExpression('*', new Fparser.ValueExpression(3), new Fparser.ValueExpression(4));
            expect(inst.operator).toBe('*');
            expect(inst.left.value).toBe(3);
            expect(inst.right.value).toBe(4);

            inst = new Fparser.MultDivExpression('/');
            expect(inst.operator).toBe('/');
            inst = new Fparser.MultDivExpression('/', new Fparser.ValueExpression(3), new Fparser.ValueExpression(4));
            expect(inst.operator).toBe('/');
            expect(inst.left.value).toBe(3);
            expect(inst.right.value).toBe(4);

            expect(() => {
                inst = new Fparser.MultDivExpression('-');
            }).toThrow();
        });
        it('evaluates correctly', () => {
            let inst = null;

            inst = new Fparser.MultDivExpression(
                '/',
                new Fparser.ValueExpression(42),
                new Fparser.VariableExpression('x')
            );
            let res = inst.evaluate({ x: -4 });
            expect(res).toEqual(-10.5);
        });
    });

    describe('PowerExpression', () => {
        it('is instantiated correctly', () => {
            let inst = null;

            inst = new Fparser.PowerExpression(new Fparser.ValueExpression(3), new Fparser.ValueExpression(4));
            expect(inst.base.value).toBe(3);
            expect(inst.exponent.value).toBe(4);
        });
        it('evaluates correctly', () => {
            let inst = null;

            inst = new Fparser.PowerExpression(new Fparser.ValueExpression(-2), new Fparser.VariableExpression('x'));
            let res = inst.evaluate({ x: 3 });
            expect(res).toEqual(-8);
        });
    });

    describe('FunctionExpression', () => {
        it('is instantiated correctly', () => {
            const formula = new Fparser();
            let inst = null;
            let args = [new Fparser.ValueExpression(3), new Fparser.ValueExpression(4)];

            inst = new Fparser.FunctionExpression('max', args, formula);
            expect(inst.fn).toEqual('max');
            expect(inst.argumentExpressions).toEqual(args);
        });
        it('evaluates correctly', () => {
            const formula = new Fparser();
            let inst = null;
            let args = [new Fparser.VariableExpression('x'), new Fparser.ValueExpression(4)];

            // deliver fn on call:
            inst = new Fparser.FunctionExpression('sum', args, formula);
            expect(inst.evaluate({ x: 3, sum: (a, b) => a + b })).toEqual(7);

            // set fn on formula object:
            formula.diff = (a, b) => a - b;
            inst = new Fparser.FunctionExpression('diff', args, formula);
            expect(inst.evaluate({ x: 5 })).toEqual(1);

            // use Math lib:
            inst = new Fparser.FunctionExpression('max', args, formula);
            expect(inst.evaluate({ x: 5 })).toEqual(5);

            // throw error if no fn found:
            inst = new Fparser.FunctionExpression('foo', args, formula);
            expect(() => inst.evaluate({ x: 5 })).toThrow();
        });
    });

    describe('VariableExpression', () => {
        it('is instantiated correctly', () => {
            let inst = null;
            inst = new Fparser.VariableExpression('zzz');
            expect(inst.varPath).toEqual(['zzz']);
        });
        it('evaluates correctly', () => {
            let inst = null;

            inst = new Fparser.VariableExpression('xxx');
            expect(inst.evaluate({ xxx: 5 })).toEqual(5);

            // Path var
            inst = new Fparser.VariableExpression('a.b');
            expect(inst.evaluate({ a: { b: 8 } })).toEqual(8);

            // Array property var
            inst = new Fparser.VariableExpression('a.b.1');
            expect(inst.evaluate({ a: { b: [3, 4, 5] } })).toEqual(4);

            // throw error if no fn found:
            inst = new Fparser.VariableExpression('foo');
            expect(() => inst.evaluate({ x: 5 })).toThrow();
        });
    });
});
