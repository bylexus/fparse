import Fparser from '../../dist/fparser.js';
describe('Variable tests', function () {
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

    it('supports user-defined functions in an object path on the expression level', function () {
        let fObj = new Fparser('3 + o.d([o.x])'); // representing 3 + 2x
        expect(fObj.evaluate({ o: { x: 2, d: (x) => x * 2 } })).toEqual(7);

        fObj = new Fparser('myFunc(obj.yourFunc([obj.x] + 8))');
        expect(
            fObj.evaluate({
                myFunc: (x) => x * 2,
                obj: {
                    yourFunc: (x) => x + 1,
                    x: 10
                }
            })
        ).toEqual(38);
    });

    it('supports user-defined functions in an object path on the object level', function () {
        let fObj = new Fparser('3 + o.d([o.x])'); // representing 3 + 2x
        fObj.o = { d: (x) => x * 2 };
        expect(fObj.evaluate({ o: { x: 2 } })).toEqual(7);

        fObj = new Fparser('myFunc(obj.yourFunc([obj.x] + 8))');
        fObj.obj = {
            yourFunc: (x) => x + 1
        };
        expect(
            fObj.evaluate({
                myFunc: (x) => x * 2,
                obj: {
                    x: 10
                }
            })
        ).toEqual(38);
    });
});
