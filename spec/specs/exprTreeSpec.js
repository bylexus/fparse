import Fparser from '../../dist/fparser.js';
describe('Expression Tree tests', function () {
    let Expression = null;
    beforeEach(function () {
        Expression = Fparser.Expression;
    });

    describe('parse()', () => {
        it('returns a single Expression object', () => {
            const formulaStr = '10 -4  *2 + 8*(-4+3*8^2)+max(x,y)';
            const f = new Fparser();
            let ret = f.parse(formulaStr);
            expect(ret).toBeInstanceOf(Expression);
        });
        it('parses a pow expression correctly', () => {
            const formulaStr = '-2^    3^ 4 ';
            const f = new Fparser();
            let ret = f.parse(formulaStr);
            expect(ret).toEqual(
                new Fparser.PowerExpression(
                    new Fparser.PowerExpression(new Fparser.ValueExpression(-2), new Fparser.ValueExpression(3)),
                    new Fparser.ValueExpression(4)
                )
            );
        });
        it('parses a mult expression correctly', () => {
            const formulaStr = '-2*    3/ 4 ';
            const f = new Fparser();
            let ret = f.parse(formulaStr);
            expect(ret).toEqual(
                new Fparser.MultDivExpression(
                    '/',
                    new Fparser.MultDivExpression('*', new Fparser.ValueExpression(-2), new Fparser.ValueExpression(3)),
                    new Fparser.ValueExpression(4)
                )
            );
        });
        it('parses a plus/min expression correctly', () => {
            const formulaStr = '-2+    3- 4 ';
            const f = new Fparser();
            let ret = f.parse(formulaStr);
            expect(ret).toEqual(
                new Fparser.PlusMinusExpression(
                    '-',
                    new Fparser.PlusMinusExpression(
                        '+',
                        new Fparser.ValueExpression(-2),
                        new Fparser.ValueExpression(3)
                    ),
                    new Fparser.ValueExpression(4)
                )
            );
        });
        it('parses a logical expression correctly', () => {
            const formulaStr = '3>1';
            const f = new Fparser();
            let ret = f.parse(formulaStr);
            expect(ret).toEqual(
                new Fparser.LogicalExpression('>', new Fparser.ValueExpression(3), new Fparser.ValueExpression(1))
            );
        });

        it('parses parentheses correctly', () => {
            const formulaStr = '2*(3+4)/4x*(3-y)';
            const f = new Fparser();
            let ret = f.parse(formulaStr);
            expect(ret).toEqual(
                new Fparser.MultDivExpression(
                    '*',
                    new Fparser.MultDivExpression(
                        '*',
                        new Fparser.MultDivExpression(
                            '/',
                            new Fparser.MultDivExpression(
                                '*',
                                new Fparser.ValueExpression(2),
                                new Fparser.BracketExpression(
                                    new Fparser.PlusMinusExpression(
                                        '+',
                                        new Fparser.ValueExpression(3),
                                        new Fparser.ValueExpression(4)
                                    )
                                )
                            ),
                            new Fparser.ValueExpression(4)
                        ),
                        new Fparser.VariableExpression('x', f)
                    ),
                    new Fparser.BracketExpression(
                        new Fparser.PlusMinusExpression(
                            '-',
                            new Fparser.ValueExpression(3),
                            new Fparser.VariableExpression('y', f)
                        )
                    )
                )
            );
        });
    });
});
