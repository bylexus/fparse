describe('Named Variable tests', function() {
    var Fparser;
    beforeEach(function() {
        if (typeof require !== 'undefined') {
            Fparser = require('../../dist/fparser');
        } else {
            Fparser = window.Formula;
        }
    });

    it('knows the named variable [varname] syntax', function() {
        var provider = [
            ['3*[myvar]', { myvar: 5 }, 15],
            ['3*[myvar]-([othervar]+[myvar]*2)', { myvar: 5, othervar: 8 }, -3],
            ['pow(2,[my_Var_Name])', { my_Var_Name: 4 }, 16],
            ['[0_starts_with_0]*[0_starts_with_0]', { '0_starts_with_0': 3 }, 9]
        ];

        provider.forEach(function(testdata) {
            expect(Fparser.calc(testdata[0], testdata[1])).toEqual(testdata[2]);
        });
    });

    it('throws an error when named variable name contains invalid chars', function() {
        var provider = [['[my-var]', /Character not allowed/]];

        provider.forEach(function(testdata) {
            expect(function() {
                Fparser.calc(testdata[0]);
            }).toThrowError(testdata[1]);
        });
    });

    it('returns also named vars in getVariables() call', function() {
        var f = new Fparser('x*2+[var1]*[var2]');
        var variables = f.getVariables();
        expect(variables).toEqual(['x', 'var1', 'var2']);
    });

    it('can evaluate named vars and Math constants correctly', function() {
        var f = new Fparser('PI*[foo]+4E');
        var variables = f.getVariables();
        expect(variables).toEqual(['PI', 'foo', 'E']);
        expect(f.getExpressionString()).toEqual('PI * foo + 4 * E');
        expect(f.evaluate({ foo: 3 })).toEqual(Math.PI * 3 + 4 * Math.E);
    });
});
