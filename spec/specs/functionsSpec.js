describe('Variable tests', function () {
    var Fparser;
    beforeEach(function () {
        if (typeof require !== 'undefined') {
            Fparser = require('../../dist/fparser-dev');
        } else {
            Fparser = window.Formula;
        }
    });

    it('supports user-defined functions on the object', function () {
        let fObj = new Fparser('lessThan(x+y, z)'); // representing x + y < z
        fObj.lessThan = (a, b) => (a < b ? 1 : 0);
        expect(fObj.evaluate({ x: 1, y: 2, z: 4 })).toEqual(1);
        expect(fObj.evaluate({ x: 6, y: 2, z: 4 })).toEqual(0);
    });

    it('supports user-defined functions on the expression level', function () {
        let fObj = new Fparser('lessThan(x+y, z)'); // representing x + y < z
        expect(fObj.evaluate({ x: 1, y: 2, z: 4, lessThan: (a, b) => (a < b ? 1 : 0) })).toEqual(1);
        expect(fObj.evaluate({ x: 6, y: 2, z: 4, lessThan: (a, b) => (a < b ? 1 : 0) })).toEqual(0);
    });
});
