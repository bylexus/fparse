/**
 * JS Formula Parser
 * -------------------
 * (c) 2012-2021 Alexander Schenkel, alex@alexi.ch
 *
 * JS Formula Parser takes a string, parses its mathmatical formula
 * and creates an evaluatable Formula object of it.
 *
 * Example input:
 *
 * var fObj = new Formula('sin(PI*x)/(2*PI)');
 * var result = fObj.evaluate({x: 2});
 * var results = fObj.evaluate([
 *     {x: 2},
 *     {x: 4},
 *     {x: 8}
 * ]);
 *
 * LICENSE:
 * -------------
 * MIT license, see LICENSE file
 */
export default class Formula {
    /**
     * Creates a new Formula instance
     *
     * @param {String} fStr The formula string, e.g. 'sin(x)/cos(y)'
     * @param {Object} options An options object (TODO)
     * @param {Formula} parentFormula Internally used to build a Formula AST
     */
    constructor(fStr, options = {}, parentFormula = null) {
        this.formulaExpression = null;
        this.variables = [];
        this.options = Object.assign({}, options);
        this.parentFormula = parentFormula || null;

        this.formulaStr = fStr;
        this.formulaExpression = this.parse(fStr);

        return this;
    }

    /**
     * Splits the given string by ',', makes sure the ',' is not within
     * a sub-expression
     * e.g.: str = "x,pow(3,4)" returns 2 elements: x and pow(3,4).
     */
    splitFunctionParams(toSplit) {
        // do not split on ',' within matching brackets.
        let pCount = 0,
            paramStr = '';
        const params = [];
        for (let chr of toSplit.split('')) {
            if (chr === ',' && pCount === 0) {
                // Found function param, save 'em
                params.push(paramStr);
                paramStr = '';
            } else if (chr === '(') {
                pCount++;
                paramStr += chr;
            } else if (chr === ')') {
                pCount--;
                paramStr += chr;
                if (pCount < 0) {
                    throw new Error('ERROR: Too many closing parentheses!');
                }
            } else {
                paramStr += chr;
            }
        }
        if (pCount !== 0) {
            throw new Error('ERROR: Too many opening parentheses!');
        }
        if (paramStr.length > 0) {
            params.push(paramStr);
        }
        return params;
    }

    /**
     * Cleans the input string from unnecessary whitespace,
     * and replaces some known constants:
     */
    cleanupInputString(s) {
        const constants = ['PI', 'E', 'LN2', 'LN10', 'LOG2E', 'LOG10E', 'SQRT1_2', 'SQRT2'];

        s = s.replace(/[\s]+/, '');
        constants.forEach(c => {
            s = s.replace(new RegExp('([^A-Za-z0-9_]+|^)' + c + '([^A-Za-z]+|$)'), '$1' + Math[c] + '$2');
        });
        return s;
    }

    /**
     * Parses the given formula string by using a state machine.
     *
     * First, we split the string into 'expression': An expression can be:
     *   - a number, e.g. '3.45'
     *   - an unknown variable, e.g. 'x'
     *   - a single char operator, such as '*','+' etc...
     *   - a named variable, in [], e.g. [myvar]
     *   - a function, such as sin(x)
     *   - a parenthessed expression, containing other expressions
     *
     * An expression represents something that can be evaluated to numbers, or which represent an operation like '+'.
     * Expressions in parentheses are instantiated as Sub-Formula objects, thus building
     * an expression Formula tree (let's not call it 'AST' already...)
     *
     * In the end, we have an array with expressions (e.g. ['3', '+', '4']), which can be evaluated
     * in the evaluate() function.
     */
    parse(str) {
        // First of all: Away with all we don't have a need for:
        // Additionally, replace some constants:
        str = this.cleanupInputString(str);

        let lastChar = str.length - 1,
            act = 0,
            state = 0,
            expressions = [],
            char = '',
            tmp = '',
            funcName = null,
            pCount = 0;

        while (act <= lastChar) {
            switch (state) {
                case 0:
                    // None state, the beginning. Read a char and see what happens.
                    char = str.charAt(act);
                    if (char.match(/[0-9.]/)) {
                        // found the beginning of a number, change state to "within-number"
                        state = 'within-nr';
                        tmp = '';
                        act--;
                    } else if (this.isOperator(char)) {
                        // Simple operators. Note: '-' must be treaten specially,
                        // it could be part of a number.
                        // it MUST be part of a number if the last found expression
                        // was an operator (or the beginning):
                        if (char === '-') {
                            if (
                                expressions.length === 0 ||
                                (expressions[expressions.length - 1] &&
                                    typeof expressions[expressions.length - 1] === 'string')
                            ) {
                                state = 'within-nr';
                                tmp = '-';
                                break;
                            }
                        }

                        // Found a simple operator, store as expression:
                        if (act === lastChar || this.isOperator(expressions[act - 1])) {
                            state = -1; // invalid to end with an operator, or have 2 operators in conjunction
                            break;
                        } else {
                            expressions.push(char);
                            state = 0;
                        }
                    } else if (char === '(') {
                        // left parenthes found, seems to be the beginning of a new sub-expression:
                        state = 'within-parentheses';
                        tmp = '';
                        pCount = 0;
                    } else if (char === '[') {
                        // left named var separator char found, seems to be the beginning of a named var:
                        state = 'within-named-var';
                        tmp = '';
                    } else if (char.match(/[a-zA-Z]/)) {
                        // multiple chars means it may be a function, else its a var which counts as own expression:
                        if (act < lastChar && str.charAt(act + 1).match(/[a-zA-Z]/)) {
                            tmp = char;
                            state = 'within-func';
                        } else {
                            // Single variable found:
                            // We need to check some special considerations:
                            // - If the last char was a number (e.g. 3x), we need to create a multiplication out of it (3*x)
                            if (expressions.length > 0) {
                                if (typeof expressions[expressions.length - 1] === 'number') {
                                    expressions.push('*');
                                }
                            }
                            expressions.push(this.createVariableEvaluator(char));
                            this.registerVariable(char);
                            state = 0;
                            tmp = '';
                        }
                    }
                    break;
                case 'within-nr':
                    char = str.charAt(act);
                    if (char.match(/[0-9.]/)) {
                        //Still within number, store and continue
                        tmp += char;
                        if (act === lastChar) {
                            expressions.push(Number(tmp));
                            state = 0;
                        }
                    } else {
                        // Number finished on last round, so add as expression:
                        if (tmp === '-') {
                            // just a single '-' means: a variable could follow (e.g. like in 3*-x), we convert it to -1: (3*-1x)
                            tmp = -1;
                        }
                        expressions.push(Number(tmp));
                        tmp = '';
                        state = 0;
                        act--;
                    }
                    break;

                case 'within-func':
                    char = str.charAt(act);
                    if (char.match(/[a-zA-Z]/)) {
                        tmp += char;
                    } else if (char === '(') {
                        funcName = tmp;
                        tmp = '';
                        pCount = 0;
                        state = 'within-func-parentheses';
                    } else {
                        throw new Error('Wrong character for function at position ' + act);
                    }

                    break;

                case 'within-named-var':
                    char = str.charAt(act);
                    if (char === ']') {
                        // end of named var, create expression:
                        expressions.push(this.createVariableEvaluator(tmp));
                        this.registerVariable(tmp);
                        tmp = '';
                        state = 0;
                    } else if (char.match(/[a-zA-Z0-9_]/)) {
                        tmp += char;
                    } else {
                        throw new Error('Character not allowed within named variable: ' + char);
                    }
                    break;

                case 'within-parentheses':
                case 'within-func-parentheses':
                    char = str.charAt(act);
                    if (char === ')') {
                        //Check if this is the matching closing parenthesis.If not, just read ahead.
                        if (pCount <= 0) {
                            // Yes, we found the closing parenthesis, create new sub-expression:
                            if (state === 'within-parentheses') {
                                expressions.push(new Formula(tmp, this.options, this));
                            } else if (state === 'within-func-parentheses') {
                                // Function found: return a function that,
                                // when evaluated, evaluates first the sub-expression
                                // then returns the function value of the sub-expression.
                                // Access to the function is private within the closure:
                                expressions.push(this.createFunctionEvaluator(tmp, funcName));
                                funcName = null;
                            }
                            state = 0;
                        } else {
                            pCount--;
                            tmp += char;
                        }
                    } else if (char === '(') {
                        // begin of a new sub-parenthesis, increase counter:
                        pCount++;
                        tmp += char;
                    } else {
                        // all other things are just added to the sub-expression:
                        tmp += char;
                    }
                    break;
            }
            act++;
        }

        if (state !== 0) {
            throw new Error('Could not parse formula: Syntax error.');
        }

        return expressions;
    }

    isOperator(char) {
        return typeof char === 'string' && char.match(/[\+\-\*\/\^]/);
    }

    registerVariable(varName) {
        if (this.parentFormula instanceof Formula) {
            this.parentFormula.registerVariable(varName);
        } else {
            if (this.variables.indexOf(varName) < 0) {
                this.variables.push(varName);
            }
        }
    }

    getVariables() {
        if (this.parentFormula instanceof Formula) {
            return this.parentFormula.variables;
        } else {
            return this.variables;
        }
    }

    /**
     * Evaluate a Formula by delivering values for the Formula's variables.
     * E.g. if the formula is '3*x^2 + 2*x + 4', you should call `evaulate` as follows:
     *
     * evaluate({x:2}) --> Result: 20
     *
     * Evaluating a Formula is done in 2 steps:
     * 1) evaluate (recursively) each element of the given array so that
     *    each expression is broken up to a simple number or operator
     * 2) now that we have only numbers and simple operators left,
     *    evaluate all operators in their correct order:
     *    first '^' (power of), then '*' and '/', and finally '+' and '-'
     *
     * After evaluating, the expression array contains one single number.
     * Return that number, aka the result.
     */
    evaluate(valueObj) {
        let item = 0,
            left = null,
            right = null,
            runAgain = true;

        // resolve multiple value objects recursively:
        if (valueObj instanceof Array) {
            return valueObj.map(v => this.evaluate(v));
        }

        // Step 0: do a working copy of the array:
        const workArr = [...this.getExpression()];

        // Step 1, evaluate
        for (let i = 0; i < workArr.length; i++) {
            /**
             * An element can be:
             *  - a number, so just let it alone for now
             *  - a string, which is a simple operator, so just let it alone for now
             *  - a function, which must return a number: execute it with valueObj
             *    and replace the item with the result.
             *  - another Formula object: resolve it recursively using this function and
             *    replace the item with the result
             */
            item = workArr[i];
            if (typeof item === 'function') {
                workArr[i] = item(valueObj);
            } else if (item instanceof Formula) {
                workArr[i] = item.evaluate(valueObj);
            } else if (typeof item !== 'number' && typeof item !== 'string') {
                throw new Error('Unknown object in Expressions array');
            }
        }

        // Now we should have a number-only array, let's evaulate the '^' operator:
        while (runAgain) {
            runAgain = false;
            for (let i = 0; i < workArr.length; i++) {
                item = workArr[i];
                if (typeof item === 'string' && item === '^') {
                    if (i === 0 || i === workArr.length - 1) {
                        throw new Error('Wrong operator position!');
                    }
                    left = Number(workArr[i - 1]);
                    right = Number(workArr[i + 1]);
                    workArr[i - 1] = Math.pow(left, right);
                    workArr.splice(i, 2);
                    runAgain = true;
                    break;
                }
            }
        }

        // Now we should have a number-only array, let's evaulate the '*','/' operators:
        runAgain = true;
        while (runAgain) {
            runAgain = false;
            for (let i = 0; i < workArr.length; i++) {
                item = workArr[i];
                if (typeof item === 'string' && (item === '*' || item === '/')) {
                    if (i === 0 || i === workArr.length - 1) {
                        throw new Error('Wrong operator position!');
                    }
                    left = Number(workArr[i - 1]);
                    right = Number(workArr[i + 1]);
                    workArr[i - 1] = item === '*' ? left * right : left / right;
                    workArr.splice(i, 2);
                    runAgain = true;
                    break;
                }
            }
        }

        // Now we should have a number-only array, let's evaulate the '+','-' operators:
        runAgain = true;
        while (runAgain) {
            runAgain = false;
            for (let i = 0; i < workArr.length; i++) {
                item = workArr[i];
                if (typeof item === 'string' && (item === '+' || item === '-')) {
                    if (i === 0 || i === workArr.length - 1) {
                        throw new Error('Wrong operator position!');
                    }
                    left = Number(workArr[i - 1]);
                    right = Number(workArr[i + 1]);
                    workArr[i - 1] = item === '+' ? left + right : left - right;
                    workArr.splice(i, 2);
                    runAgain = true;
                    break;
                }
            }
        }

        // In the end the original array should be reduced to a single item,
        // containing the result:
        return workArr[0];
    }

    getExpression() {
        return this.formulaExpression;
    }

    /**
     * Returns a function which acts as an expression for functions:
     * Its inner arguments are parsed, split by comma, and evaluated
     * first when then function is executed.
     *
     * Used for e.g. evaluate things like "max(x*3,20)"
     *
     * The returned function is called later by evaluate(), and takes
     * an evaluation object with the needed values.
     */
    createFunctionEvaluator(arg, fname) {
        // Functions can have multiple params, comma separated.
        // Split them:
        let args = this.splitFunctionParams(arg).map(a => new Formula(a, this.options, this));

        // Args now is an array of function expressions:
        return valueObj => {
            const innerValues = args.map(a => a.evaluate(valueObj));

            // If the valueObj itself has a function definition with
            // the function name, call this one:
            if (valueObj && typeof valueObj[fname] === 'function') {
                return valueObj[fname].apply(this, innerValues);
            } else if (typeof this[fname] === 'function') {
                // perhaps the Formula object has the function? so call it:
                return this[fname].apply(this, innerValues);
            } else if (typeof Math[fname] === 'function') {
                // Has the JS Math object a function as requested? Call it:
                return Math[fname].apply(this, innerValues);
            } else {
                throw new Error('Function not found: ' + fname);
            }
        };
    }

    /**
     * Returns a function which acts as an expression evaluator for variables:
     * It creates an intermediate function that is called by the evaluate() function
     * with a value object. The function then returns the value from the value
     * object, if defined.
     */
    createVariableEvaluator(varname) {
        return function(valObj = {}) {
            // valObj contains a variable / value pair: If the variable matches
            // the varname found as expression, return the value.
            // eg: valObj = {x: 5,y:3}, varname = x, return 5
            if (valObj[varname] !== undefined) {
                return valObj[varname];
            } else {
                throw new Error('Cannot evaluate ' + varname + ': No value given');
            }
        };
    }

    static calc(formula, valueObj, options = {}) {
        valueObj = valueObj || {};
        return new Formula(formula, options).evaluate(valueObj);
    }
}
