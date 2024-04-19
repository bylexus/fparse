import Fparser from '../../dist/fparser.js';
describe('String basic feature', function () {
    beforeEach(function () {
        if (typeof require !== 'undefined') {
            Fparser = require('../../dist/fparser-dev');
        } else {
            Fparser = window.Formula;
        }
    });

    it('support parsing with double quotes', function () {
        expect(Fparser.calc('"foo"')).toEqual('foo');
    });

    it('allow spaces', function () {
        expect(Fparser.calc('" "')).toEqual(' ');
        expect(Fparser.calc('"   "')).toEqual('   ');
    });

    it('allow special chars', function () {
        expect(Fparser.calc('"["')).toEqual('[');
        expect(Fparser.calc('"]"')).toEqual(']');
        expect(Fparser.calc('"("')).toEqual('(');
        expect(Fparser.calc('")"')).toEqual(')');
        expect(Fparser.calc('"*+-/^"')).toEqual('*+-/^');
    });

    it('correct in parentheses', function () {
        expect(Fparser.calc('(")")')).toEqual(')');
    });

    it('support usage by variable', function () {
        expect(Fparser.calc('x', { x: 'foo' })).toEqual('foo');
        expect(Fparser.calc('[myVar]', { myVar: 'foo' })).toEqual('foo');
    });

    it('support usage by custom function', function () {
        const myFnFoo = (x) => 'foo' + x;
        expect(Fparser.calc('myFnFoo("bar")', { myFnFoo: myFnFoo })).toEqual('foobar');
        expect(Fparser.calc('myFnFoo(x)', { myFnFoo: myFnFoo, x: 'bar' })).toEqual('foobar');
        expect(Fparser.calc('myFnFoo([myVar])', { myFnFoo: myFnFoo, myVar: 'bar' })).toEqual('foobar');
    });

    it('blocking math operator "*" of number and variable', function () {
        const expectedError = 'Math operators required type of number: given is string';
        expect(() => Fparser.calc('2x', { x: 'foo' })).toThrowError(expectedError);
    });

    it('blocking math operator "+"', function () {
        const provider = ['"foo" + 123', '123 + "foo"', '"foo" + "bar"', '("foo") + 123', '123 + ("foo")'];

        provider.forEach(function (formula) {
            expect(() => Fparser.calc(formula)).toThrowError('Math operators required type of number: given is string');
        });
    });

    it('blocking math operator "-"', function () {
        const provider = ['"foo" - 123', '123 - "foo"', '"foo" - "bar"', '("foo") - 123', '123 - ("foo")'];

        provider.forEach(function (formula) {
            expect(() => Fparser.calc(formula)).toThrowError('Math operators required type of number: given is string');
        });
    });

    it('blocking math operator "*"', function () {
        const provider = ['"foo" * 123', '123 * "foo"', '"foo" * "bar"', '("foo") * 123', '123 * ("foo")'];

        provider.forEach(function (formula) {
            expect(() => Fparser.calc(formula)).toThrowError('Math operators required type of number: given is string');
        });
    });

    it('blocking math operator "/"', function () {
        const provider = ['"foo" / 123', '123 / "foo"', '"foo" / "bar"', '("foo") / 123', '123 / ("foo")'];

        provider.forEach(function (formula) {
            expect(() => Fparser.calc(formula)).toThrowError('Math operators required type of number: given is string');
        });
    });

    it('blocking math operator "^"', function () {
        const provider = ['"foo" ^ 123', '123 ^ "foo"', '"foo" ^ "bar"', '("foo") ^ 123', '123 ^ ("foo")'];

        provider.forEach(function (formula) {
            expect(() => Fparser.calc(formula)).toThrowError('Math operators required type of number: given is string');
        });
    });

    it('blocking math functions', function () {
        const provider = ['sin("foo")', 'sin(("foo"))'];

        provider.forEach(function (formula) {
            expect(() => Fparser.calc(formula)).toThrowError('Math functions required type of number: given is string');
        });
    });
});
