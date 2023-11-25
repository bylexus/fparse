import Fparser from '../../dist/fparser.js';
describe('Function blacklisting spec', function () {
    describe('FunctionExpression', function () {
        it('allows blacklisted functions during parsing time', function () {
            let expr = new Fparser('evaluate(x)');
            expect(expr).toBeInstanceOf(Fparser);
        });

        it('allows blacklisted functions when provided as evaluation property', function () {
            let expr = new Fparser('evaluate(x)');
            let res = expr.evaluate({ x: 42, evaluate: (x) => x });
            expect(res).toEqual(42);
        });

        it('throws an error when a non user-provided blacklisted function is requested', function () {
            // internal function:
            let expr = new Fparser('evaluate(x)');
            expect(() => expr.evaluate({ x: 42 })).toThrowError('Blacklisted function called: evaluate');

            // internal function, referenced with another name:
            let expr2 = new Fparser('ex(x)');
            expr2.ex = expr2.evaluate;
            expect(() => expr2.evaluate({ x: 42 })).toThrowError('Blacklisted function called: ex');
        });

        it('function blacklist is modifiable', function () {
            // use an unlisted function:
            let mooFn = (x) => x;
            let expr = new Fparser('moo(x)');
            expr.moo = mooFn;
            expect(expr.evaluate({ x: 42 })).toEqual(42);

            // now blacklist the function:
            Fparser.functionBlacklist.push(mooFn);

            let expr2 = new Fparser('moo(x)');
            expr2.moo = mooFn;
            expect(() => expr2.evaluate({ x: 42 })).toThrowError('Blacklisted function called: moo');
        });
    });
});
