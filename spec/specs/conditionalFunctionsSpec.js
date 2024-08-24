import Fparser from '../../dist/fparser.js';
describe('Conditional Functions', function () {
    it('ifElse with numbers', function () {
        const fObj = new Fparser('ifElse(x < 0, y, z)');
        const res = fObj.evaluate([
            { x: -1, y: 1, z: 2 },
            { x: 0, y: 1, z: 2 },
            { x: 1, y: 1, z: 2 }
        ]);
        expect(res).toEqual([1, 2, 2]);
    });

    it('ifElse with strings', function () {
        const fObj = new Fparser('ifElse([x.length] > 0, y, z)');
        const res = fObj.evaluate([
            { x: '', y: 1, z: 2 },
            { x: 'one', y: 1, z: 2 }
        ]);
        expect(res).toEqual([2, 1]);
    });

    it('ifElse with arrays', function () {
        const fObj = new Fparser('ifElse([x.length] > 0, y, z)');
        const res = fObj.evaluate([
            { x: [1, 2, 3], y: 1, z: 2 },
            { x: [], y: 1, z: 2 }
        ]);
        expect(res).toEqual([1, 2]);
    });
});
