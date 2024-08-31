import Fparser from '../../dist/fparser.js';
describe('Conditional Functions', function () {
    describe('ifElse', () => {
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

    describe('first', () => {
        it('first with numbers', function () {
            const fObj = new Fparser('first(x,y,z,[else])');
            const res = fObj.evaluate([
                { x: 0, y: 0, z: 0, else: -1 },
                { x: 0, y: 1, z: 2, else: -1 },
                { x: 2, y: 1, z: 0, else: -1 },
                { x: 0, y: -2, z: -3, else: -1 }
            ]);
            expect(res).toEqual([-1, 1, 2, -2]);
        });
    });
});
