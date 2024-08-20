import Fparser from '../../dist/fparser.js';

describe('String basic feature', function () {
    it('support parsing with double quotes', function () {
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

    it('works with string parameters in a real example', function () {
        const leftElseRight = (l, op, r) => {
            switch (op) {
                case '<':
                    return l < r ? l : r;
                case '>':
                    return l > r ? l : r;
                default:
                    throw new Error('Invalid operator: ' + op);
            }
        };
        let res = new Fparser('4*leftElseRight([var1], "<", [var2])').evaluate({ var1: 1, var2: 2, leftElseRight });
        expect(res).toEqual(4);

        res = new Fparser('4*leftElseRight([var1], ">", [var2])').evaluate({ var1: 1, var2: 2, leftElseRight });
        expect(res).toEqual(8);
    });

    it('evaluates a string result', function () {
        let res = new Fparser('concat([var1], "Bar")').evaluate({ var1: 'Foo', concat: (s1, s2) => s1 + s2 });
        expect(res).toEqual('FooBar');
    });
});
