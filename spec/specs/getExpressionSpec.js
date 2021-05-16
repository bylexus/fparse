describe('Get Expression tests', function() {
    let Fparser = null;

    beforeEach(function() {
        if (typeof require !== 'undefined') {
            Fparser = require('../../dist/fparser.js');
        } else {
            Fparser = window.Formula;
        }
    });

    describe('getExpression', () => {
        it('returns the root node', () => {
            let inst = new Fparser('3*(4*2)');
            expect(inst.getExpression()).toEqual(
                new Fparser.MultDivExpression(
                    '*',
                    new Fparser.ValueExpression(3),
                    new Fparser.MultDivExpression('*', new Fparser.ValueExpression(4), new Fparser.ValueExpression(2))
                )
            );
        });
    });

    describe('ValueExpression::toString', () => {
        it('returns the expression as expression string', () => {
            let inst = new Fparser.ValueExpression('   -0.3   ');
            expect(inst.toString()).toEqual('-0.3');
        });
    });

    describe('PlusMinusExpression::toString', () => {
        it('returns the expression as expression string', () => {
            let inst = new Fparser.PlusMinusExpression(
                '+',
                new Fparser.ValueExpression(-3),
                new Fparser.ValueExpression(-18.5)
            );
            expect(inst.toString()).toEqual('-3 + -18.5');
        });
        it('uses brackets if right side is lower/equal prio expression', () => {
            let inst = new Fparser.PlusMinusExpression(
                '-',
                new Fparser.ValueExpression(-3),
                new Fparser.PlusMinusExpression('+', new Fparser.ValueExpression(3), new Fparser.ValueExpression(4))
            );
            expect(inst.toString()).toEqual('-3 - (3 + 4)');
        });
        it('uses NO brackets if operator is "+"', () => {
            let inst = new Fparser.PlusMinusExpression(
                '+',
                new Fparser.ValueExpression(-3),
                new Fparser.PlusMinusExpression('+', new Fparser.ValueExpression(-3), new Fparser.ValueExpression(4))
            );
            expect(inst.toString()).toEqual('-3 + -3 + 4');
        });
        it('uses NO brackets if right side is higher prio', () => {
            let inst = new Fparser.PlusMinusExpression(
                '-',
                new Fparser.ValueExpression(-3),
                new Fparser.MultDivExpression('/', new Fparser.ValueExpression(-3), new Fparser.ValueExpression(4))
            );
            expect(inst.toString()).toEqual('-3 - -3 / 4');

            inst = new Fparser.PlusMinusExpression(
                '-',
                new Fparser.ValueExpression(-3),
                new Fparser.PowerExpression(new Fparser.ValueExpression(-3), new Fparser.ValueExpression(4))
            );
            expect(inst.toString()).toEqual('-3 - -3^4');

            inst = new Fparser.PlusMinusExpression(
                '-',
                new Fparser.ValueExpression(-3),
                new Fparser.FunctionExpression('sin', [new Fparser.ValueExpression(3)])
            );
            expect(inst.toString()).toEqual('-3 - sin(3)');
            inst = new Fparser.PlusMinusExpression(
                '-',
                new Fparser.ValueExpression(-3),
                new Fparser.VariableExpression('foo')
            );
            expect(inst.toString()).toEqual('-3 - foo');
        });
    });

    describe('MultDivExpression::toString', () => {
        it('returns the expression as expression string', () => {
            let inst = new Fparser.MultDivExpression(
                '/',
                new Fparser.ValueExpression(-3),
                new Fparser.ValueExpression(-18.5)
            );
            expect(inst.toString()).toEqual('-3 / -18.5');
        });
        it('uses brackets if right side is lower/equal prio expression', () => {
            let inst = new Fparser.MultDivExpression(
                '/',
                new Fparser.ValueExpression(-3),
                new Fparser.PlusMinusExpression('+', new Fparser.ValueExpression(3), new Fparser.ValueExpression(4))
            );
            expect(inst.toString()).toEqual('-3 / (3 + 4)');

            inst = new Fparser.MultDivExpression(
                '*',
                new Fparser.ValueExpression(-3),
                new Fparser.PlusMinusExpression('+', new Fparser.ValueExpression(3), new Fparser.ValueExpression(4))
            );
            expect(inst.toString()).toEqual('-3 * (3 + 4)');

            inst = new Fparser.MultDivExpression(
                '/',
                new Fparser.ValueExpression(-3),
                new Fparser.MultDivExpression('*', new Fparser.ValueExpression(3), new Fparser.ValueExpression(4))
            );
            expect(inst.toString()).toEqual('-3 / (3 * 4)');
        });

        it('uses NO brackets if operator is "*"', () => {
            let inst = new Fparser.MultDivExpression(
                '*',
                new Fparser.ValueExpression(-3),
                new Fparser.MultDivExpression('/', new Fparser.ValueExpression(-3), new Fparser.ValueExpression(4))
            );
            expect(inst.toString()).toEqual('-3 * -3 / 4');
        });
        it('uses NO brackets if right side is higher prio', () => {
            let inst = new Fparser.MultDivExpression(
                '/',
                new Fparser.ValueExpression(-3),
                new Fparser.PowerExpression(new Fparser.ValueExpression(-3), new Fparser.ValueExpression(4))
            );
            expect(inst.toString()).toEqual('-3 / -3^4');

            inst = new Fparser.MultDivExpression(
                '/',
                new Fparser.ValueExpression(-3),
                new Fparser.FunctionExpression('sin', [new Fparser.ValueExpression(3)])
            );
            expect(inst.toString()).toEqual('-3 / sin(3)');
            inst = new Fparser.MultDivExpression(
                '/',
                new Fparser.ValueExpression(-3),
                new Fparser.VariableExpression('foo')
            );
            expect(inst.toString()).toEqual('-3 / foo');
        });
    });

    describe('PowerExpression::toString', () => {
        it('returns the expression as expression string', () => {
            let inst = new Fparser.PowerExpression(new Fparser.ValueExpression(-3), new Fparser.ValueExpression(7));
            expect(inst.toString()).toEqual('-3^7');
        });
        it('uses brackets if right side is lower/equal prio expression', () => {
            let inst = new Fparser.PowerExpression(
                new Fparser.ValueExpression(-3),
                new Fparser.PlusMinusExpression('+', new Fparser.ValueExpression(3), new Fparser.ValueExpression(4))
            );
            expect(inst.toString()).toEqual('-3^(3 + 4)');

            inst = new Fparser.PowerExpression(
                new Fparser.ValueExpression(-3),
                new Fparser.MultDivExpression('/', new Fparser.ValueExpression(3), new Fparser.ValueExpression(4))
            );
            expect(inst.toString()).toEqual('-3^(3 / 4)');

            inst = new Fparser.PowerExpression(
                new Fparser.ValueExpression(-3),
                new Fparser.PowerExpression(new Fparser.ValueExpression(3), new Fparser.ValueExpression(4))
            );
            expect(inst.toString()).toEqual('-3^(3^4)');
        });
        it('uses NO brackets if right side is higher prio', () => {
            let inst = new Fparser.PowerExpression(
                new Fparser.ValueExpression(-3),
                new Fparser.FunctionExpression('sin', [new Fparser.ValueExpression(3)])
            );
            expect(inst.toString()).toEqual('-3^sin(3)');

            inst = new Fparser.PowerExpression(new Fparser.ValueExpression(-3), new Fparser.VariableExpression('foo'));
            expect(inst.toString()).toEqual('-3^foo');
        });
    });

    describe('FunctionExpression::toString', () => {
        it('returns the expression as expression string', () => {
            let inst = new Fparser.FunctionExpression('max', [
                new Fparser.ValueExpression(-3),
                new Fparser.ValueExpression(7)
            ]);
            expect(inst.toString()).toEqual('max(-3, 7)');
        });
    });

    describe('VariableExpression::toString', () => {
        it('returns the expression as expression string', () => {
            let inst = new Fparser.VariableExpression('foo');
            expect(inst.toString()).toEqual('foo');
        });
    });

    describe('getExpressionString', () => {
        it('returns the expression as expression string', () => {
            let inst = new Fparser('0.3     *(-4  +2   )');
            expect(inst.getExpressionString()).toEqual('0.3 * (-4 + 2)');
        });
    });
});
