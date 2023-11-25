import Fparser from '../../dist/fparser.js';

describe('Variable tests', function () {
    it('parses 3*x correctly', function () {
        expect(Fparser.calc('3*x', { x: 5 })).toEqual(15);
    });

    it('parses -3*x correctly', function () {
        expect(Fparser.calc('-3*x', { x: 5 })).toEqual(-15);
    });
    it('parses 3*-x correctly', function () {
        expect(Fparser.calc('3*-x', { x: 5 })).toEqual(-15);
    });
    it('parses -3x correctly', function () {
        expect(Fparser.calc('-3x', { x: 5 })).toEqual(-15);
    });
    it('parses -3x^2 correctly', function () {
        expect(Fparser.calc('-3x^2', { x: 5 })).toEqual(-75);
    });
    it('parses -3x^2 correctly', function () {
        expect(Fparser.calc('-3x^2', { x: 5 })).toEqual(-75);
    });
    it('parses -z+t correctly (Issue #22)', function () {
        expect(Fparser.calc('-z+t', { z: 5, t: 3 })).toEqual(-2);
    });
});
