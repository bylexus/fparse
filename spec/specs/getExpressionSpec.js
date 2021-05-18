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
                    new Fparser.BracketExpression(
                        new Fparser.MultDivExpression(
                            '*',
                            new Fparser.ValueExpression(4),
                            new Fparser.ValueExpression(2)
                        )
                    )
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

    describe('BracketExpression::toString', () => {
        it('returns the expression as expression string', () => {
            let inst = new Fparser.BracketExpression(
                new Fparser.FunctionExpression('sin', [new Fparser.ValueExpression(2)])
            );
            expect(inst.toString()).toEqual('(sin(2))');
        });
    });

    describe('PlusMinusExpression::toString', () => {
        it('returns the expression as expression string', () => {
            let f = new Fparser('-3       +-18.5');
            expect(f.getExpression().toString()).toEqual('-3 + -18.5');
        });
        it('returns the expression as expression string for more complex formulas', () => {
            let f = new Fparser('(-3-(2+8) )^ (sin   (x)-3)');
            expect(f.getExpression().toString()).toEqual('(-3 - (2 + 8))^(sin(x) - 3)');
        });
    });

    describe('MultDivExpression::toString', () => {
        it('returns the expression as expression string', () => {
            let f = new Fparser('-3       /-18.5');
            expect(f.getExpression().toString()).toEqual('-3 / -18.5');
        });
        it('returns the expression as expression string for more complex formulas', () => {
            let f = new Fparser('(-3/(2*8) )^ (sin   (x)*3)');
            expect(f.getExpression().toString()).toEqual('(-3 / (2 * 8))^(sin(x) * 3)');
        });
    });

    describe('PowerExpression::toString', () => {
        it('returns the expression as expression string', () => {
            let f = new Fparser('-3       ^-18.5');
            expect(f.getExpression().toString()).toEqual('-3^-18.5');
        });
        it('returns the expression as expression string for more complex formulas', () => {
            let f = new Fparser('(-3^(2^8) )^ (sin   (x)^3)');
            expect(f.getExpression().toString()).toEqual('(-3^(2^8))^(sin(x)^3)');
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
