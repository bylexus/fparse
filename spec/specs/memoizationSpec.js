import Fparser from '../../dist/fparser.js';
describe('Memoization', function () {
    it('can be enabled by options', function () {
        let f = new Fparser('x');
        expect(f.options.memoization).toBeFalse();

        f = new Fparser('x', { memoization: true });
        expect(f.options.memoization).toBeTrue();

        f = new Fparser('x', { memoization: false });
        expect(f.options.memoization).toBeFalse();
    });

    it('can be enabled / disabled by function', function () {
        const f = new Fparser();
        expect(f.options.memoization).toBeFalse();
        f.enableMemoization();
        expect(f.options.memoization).toBeTrue();
        f.disableMemoization();
        expect(f.options.memoization).toBeFalse();
    });

    it('resultFromMemory() uses internal cache', () => {
        const f = new Fparser('x+2', { memoization: true });
        const key = JSON.stringify({ x: 5 });
        f._memory = { [key]: 7 };
        let res = f.resultFromMemory({ x: 5 });
        expect(res).toEqual(7);

        res = f.resultFromMemory({ x: 4 });
        expect(res).toEqual(null);
    });

    it('gets results from memory, if enabled', function () {
        const f = new Fparser('x+2', { memoization: true });
        spyOn(f.formulaExpression, 'evaluate').and.callThrough();
        spyOn(f, 'resultFromMemory').and.callThrough();
        spyOn(f, 'storeInMemory').and.callThrough();
        let res1 = f.evaluate({ x: 5 });
        let res2 = f.evaluate({ x: 5 });
        let res4 = f.evaluate({ x: 6 });
        let res3 = f.evaluate({ x: 5 });
        expect(res1).toEqual(7);
        expect(res2).toEqual(7);
        expect(res3).toEqual(7);
        expect(res4).toEqual(8);
        expect(f.formulaExpression.evaluate).toHaveBeenCalledTimes(2);
        expect(f.resultFromMemory).toHaveBeenCalledTimes(4);
        expect(f.storeInMemory).toHaveBeenCalledTimes(2);
    });

    it('resets the memory when a new formula is set', function () {
        const f = new Fparser('x+2', { memoization: true });
        let res1 = f.evaluate({ x: 5 });
        let res2 = f.evaluate({ x: 5 });
        expect(res1).toEqual(7);
        expect(res2).toEqual(7);
        expect(f._memory).toEqual({ [JSON.stringify({ x: 5 })]: 7 });
        f.setFormula('x+3');
        expect(f._memory).toEqual({});
    });

    it('stores the different results per input', function () {
        const f = new Fparser('x+2', { memoization: true });
        f.evaluate({ x: 5 });
        f.evaluate({ x: 6 });
        f.evaluate({ x: 5 });
        f.evaluate({ x: 6 });
        expect(f._memory).toEqual({ [JSON.stringify({ x: 5 })]: 7, [JSON.stringify({ x: 6 })]: 8 });
    });
});
