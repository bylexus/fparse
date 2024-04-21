import Fparser from '../../dist/fparser.js';

describe('String basic feature', function () {
    it('support parsing with single and double quotes', function () {
        expect(new Fparser('"foo"').evaluate()).toEqual('foo');
    });

    it('allow spaces', function () {
        expect(new Fparser('" "').evaluate()).toEqual(' ');
        expect(new Fparser('"   "').evaluate()).toEqual('   ');
    });

    it('allow special chars', function () {
        expect(new Fparser('"["').evaluate()).toEqual('[');
        expect(new Fparser('"]"').evaluate()).toEqual(']');
        expect(new Fparser('"("').evaluate()).toEqual('(');
        expect(new Fparser('")"').evaluate()).toEqual(')');
        expect(new Fparser('"*+-/^"').evaluate()).toEqual('*+-/^');
    });

    it('correct in parentheses', function () {
        expect(new Fparser('(")")').evaluate()).toEqual(')');
    });

    it('support usage by variable', function () {
        expect(new Fparser('x').evaluate({ x: 'foo' })).toEqual('foo');
    });

    it('support usage by named variable', function () {
        expect(new Fparser('[myVar]').evaluate({ myVar: 'foo' })).toEqual('foo');
    });

    it('support usage by custom function', function () {
        const myFnFoo = (x) => 'foo' + x;

        expect(new Fparser('myFnFoo("bar")').evaluate({ myFnFoo: myFnFoo })).toEqual('foobar');
        expect(new Fparser('myFnFoo(x)').evaluate({ myFnFoo: myFnFoo, x: 'bar' })).toEqual('foobar');
        expect(new Fparser('myFnFoo([myVar])').evaluate({ myFnFoo: myFnFoo, myVar: 'bar' })).toEqual('foobar');
    });

    // it('blocking math operator "*" of number and variable', function () {
    //     expect(new Fparser('2x').evaluate('2x', { x: 'foo' })).toThrowError(
    //         /Math operators required type of number: given is string/
    //     );
    // });

    it('blocking math operator "+"', function () {
        const operations = ['"foo" + 123', '123 + "foo"', '"foo" + "bar"', '("foo") + 123', '123 + ("foo")'];

        operations.forEach((operation) => {
            expect(() => new Fparser(operation).evaluate()).toThrowError(/Strings are not allowed in math operations/);
        });
    });

    it('blocking math operator "-"', function () {
        const operations = ['"foo" - 123', '123 - "foo"', '"foo" - "bar"', '("foo") - 123', '123 - ("foo")'];

        operations.forEach((operation) => {
            expect(() => new Fparser(operation).evaluate()).toThrowError(/Strings are not allowed in math operations/);
        });
    });

    it('blocking math operator "*"', function () {
        const operations = ['"foo" * 123', '123 * "foo"', '"foo" * "bar"', '("foo") * 123', '123 * ("foo")'];

        operations.forEach((operation) => {
            expect(() => new Fparser(operation).evaluate()).toThrowError(/Strings are not allowed in math operations/);
        });
    });

    it('blocking math operator "/"', function () {
        const operations = ['"foo" * 123', '123 * "foo"', '"foo" * "bar"', '("foo") * 123', '123 * ("foo")'];

        operations.forEach((operation) => {
            expect(() => new Fparser(operation).evaluate()).toThrowError(/Strings are not allowed in math operations/);
        });
    });

    it('blocking math operator "^"', function () {
        const operations = ['"foo" ^ 123', '123 ^ "foo"', '"foo" ^ "bar"', '("foo") ^ 123', '123 ^ ("foo")'];

        operations.forEach((operation) => {
            expect(() => new Fparser(operation).evaluate()).toThrowError(/Strings are not allowed in math operations/);
        });
    });
});
