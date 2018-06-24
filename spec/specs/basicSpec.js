describe('Basic tests', function() {
    var Fparser;
    beforeEach(function() {
        if (typeof require !== 'undefined') {
            Fparser = require('../../dist/fparser');
        } else {
            Fparser = window.Formula;
        }
    });

    it('can be required as a node module', function() {
        expect(Fparser).toBeDefined();
    });

    it('parses a simple formula without variables', function() {
        var f = new Fparser('10 -4  *2 + 8');
        var res = f.evaluate();
        expect(res).toEqual(10);
    });

    it('parses a formula with variables, expects values for each', function() {
        var f = new Fparser('10 -x  *2 + y');

        expect(function() {
            f.evaluate();
        }).toThrowError(/Cannot evaluate x/);
        expect(function() {
            f.evaluate({ x: 3 });
        }).toThrowError(/Cannot evaluate y/);

        var res = f.evaluate({ x: 3, y: 5 });
        expect(res).toEqual(9);
    });

    it('throws a syntax error when parsing failed', function() {
        expect(function() {
            new Fparser('10+');
        }).toThrowError(/Syntax error/);
        expect(function() {
            new Fparser('-3*4^');
        }).toThrowError(/Syntax error/);
        expect(function() {
            new Fparser('4*5+++');
        }).toThrowError(/Syntax error/);
        expect(function() {
            new Fparser('4***5');
        }).toThrowError(/Syntax error/);
    });

    it('parses parenthesis correctly', function() {
        var f = new Fparser('4*(2+8/(3.0+2.0))');
        expect(f.evaluate()).toEqual(4 * (2 + 8 / (3.0 + 2.0)));
    });

    it('knows the Math constants and can parse them within a formula', function() {
        var constants = ['PI', 'E', 'LN2', 'LN10', 'LOG2E', 'LOG10E', 'SQRT1_2', 'SQRT2'];

        var f;
        constants.forEach(function(c) {
            f = new Fparser('3*' + c + ' + 5');
            expect(f.evaluate()).toEqual(3 * Math[c] + 5);
        });
    });
});
