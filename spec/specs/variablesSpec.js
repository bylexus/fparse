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
    // Removed tests for implicit multiplication (-3x syntax) as it's no longer supported in v4.0
    // Explicit multiplication is now required: -3*x
    it('parses -z+t correctly (Issue #22)', function () {
        expect(Fparser.calc('-z+t', { z: 5, t: 3 })).toEqual(-2);
    });
});
