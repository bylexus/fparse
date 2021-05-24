<template>
    <div>
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <div class="container-fluid bg-dark bg-gradient text-white">
                <h1>fparser - A JavaScript Formula parser library</h1>
            </div>
        </nav>
        <div class="container-fluid">
            <p>
                fparser is a Formula parser library for JavaScript - it parses mathematical equations from strings, and
                evaluates them to numbers.
            </p>
            <p>
                <a href="https://github.com/bylexus/fparse">@see the github page</a> for a more detailed usage
                documentation.<br />
                The source code of this page can be found <a href="https://github.com/bylexus/fparse/blob/develop/demopage/src/App.vue">here</a>.
            </p>

            <p>
                This page just demonstrate its usage in a real-life application. Play around with adding formular and
                modify the diagram parameters - fparser will draw the diagram for you.
            </p>

            <h2>Features</h2>
            <p>Parses a mathematical formula from a string. Known expressions:</p>

            <ul>
                <li><em>Numbers</em> in the form [-]digits[.digits], e.g. &quot;-133.2945&quot;</li>
                <li><em>simple operators</em>: '+','-','*','/', '^' expanded in correct order</li>
                <li><em>parentheses</em> '(', ')' for grouping (e.g. &quot;5*(3+2)&quot;)</li>
                <li>all <em>JavaScript Math object functions</em> (e.g. &quot;sin(3.14)&quot;)</li>
                <li>all <em>JavaScript Math constants</em> like PI, E</li>
                <li>the use of <em>own functions</em></li>
                <li>the use of single-char <em>variables</em> (like '2x')</li>
                <li>the use of named variables (like '2*[myVar]')</li>
                <li><em>memoization</em>: store already evaluated results for faster re-calcs</li>
                <li>use it in Web pages, as ES6 module or as NodeJS module</li>
                <li>
                    Example:<br />
                    <code>-1*(sin(2^x)/(PI*x))*cos(x))</code>
                </li>
            </ul>

            <h2>Demo Application</h2>
            <div class="row">
                <div class="col-12 col-lg-4">
                    <div class="card">
                        <div class="card-header">Enter formula <small>(Note: just use 'x' as variable)</small>:</div>
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <input
                                    type="text"
                                    placeholder="e.g. 'sin(x*PI/4)'"
                                    v-model="formula"
                                    class="flex-grow-1 me-2"
                                />
                                <button type="button" class="btn btn-primary btn-sm" @click.stop="addFormula">
                                    add
                                </button>
                            </div>
                            <div v-if="error" class="alert alert-danger" role="alert">
                                {{ error }}
                            </div>
                        </div>
                    </div>

                    <div class="card mt-3">
                        <div class="card-header">Formulas:</div>
                        <div class="list-group">
                            <div
                                v-for="formula in formulas"
                                :key="formula"
                                class="list-group-item list-group-item-action"
                                aria-current="true"
                            >
                                <div class="d-flex justify-content-between">
                                    <code>{{ formula }}</code>
                                    <button
                                        type="button"
                                        class="btn btn-primary btn-sm"
                                        @click.stop="removeFormula(formula)"
                                    >
                                        del
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card mt-3">
                        <div class="card-header">Evaluate single value:</div>
                        <div class="card-body">
                            <form>
                                <label for="manualFormula" class="form-label">Enter arbitary formula:</label>
                                <input
                                    type="text"
                                    v-model.lazy="manualFormula"
                                    id="manualFormula"
                                    class="form-control"
                                    placeholder="e.g. 'x*y/z"
                                />
                                <div v-if="formulaObject">
                                    <div v-for="variable in getVariables(formulaObject)" :key="variable" class="mt-3">
                                        <label :for="`single-var-${variable}`" class="form-label">
                                            Number Value for {{ variable }}:
                                        </label>
                                        <input
                                            v-model="singleVar[variable]"
                                            type="number"
                                            class="form-control"
                                            :id="`single-var-${variable}`"
                                        />
                                    </div>
                                </div>
                                <button type="button" class="mt-3 btn btn-primary" @click.stop="calcSingleValue">
                                    Calc
                                </button>
                                <div v-if="singleError" class="alert alert-danger" role="alert">
                                    {{ singleError }}
                                </div>
                                <div v-if="result !== null" class="mt-3">
                                    <div class="alert alert-success">
                                        <strong>Result: </strong><span>{{ result }}</span>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="col-12 col-lg-8">
                    <div class="card">
                        <div class="card-header">Diagram - Values evaluated using fparser</div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-2">min x:</div>
                                <div class="col-4"><input type="text" v-model="minX" class="form-control" /></div>
                                <div class="col-2">max x:</div>
                                <div class="col-4"><input type="text" v-model="maxX" class="form-control" /></div>
                            </div>
                            <div class="row mt-2">
                                <div class="col-2">min y:</div>
                                <div class="col-4"><input type="text" v-model="minY" class="form-control" /></div>
                                <div class="col-2">max y:</div>
                                <div class="col-4"><input type="text" v-model="maxY" class="form-control" /></div>
                            </div>
                            <div class="row mt-2">
                                <div class="col-2">x inc:</div>
                                <div class="col-4"><input type="text" v-model="xInc" class="form-control" /></div>
                                <div class="col">
                                    <button type="button" class="btn btn-primary" @click.stop="this.redrawDiagram()">
                                        redraw
                                    </button>
                                </div>
                            </div>
                            <canvas ref="chart" width="800" height="600"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card mt-5">
                <div class="card-header">
                    <h2 id="usage">Usage</h2>
                </div>
                <div class="card-body">
                    <pre><code class="language-html"><div><span class="hljs-comment">&lt;!-- Within a web page: Load the fparser library: --&gt;</span>
<span class="hljs-tag">&lt;<span class="hljs-name">script</span> <span class="hljs-attr">src</span>=<span class="hljs-string">&quot;dist/fparser.js&quot;</span>&gt;</span><span class="hljs-tag">&lt;/<span class="hljs-name">script</span>&gt;</span>
</div></code></pre>
                    <pre><code class="language-javascript"><div><span class="hljs-comment">// As node module:</span>
<span class="hljs-attr">Install</span>:
$ npm install --save fparser

<span class="hljs-attr">Use</span>:
<span class="hljs-keyword">const</span> Formula = <span class="hljs-built_in">require</span>(<span class="hljs-string">&#x27;fparser&#x27;</span>);

or:
<span class="hljs-keyword">import</span> Formula <span class="hljs-keyword">from</span> <span class="hljs-string">&#x27;fparser&#x27;</span>;
</div></code></pre>
                    <pre><code class="language-javascript"><div><span class="hljs-comment">// 1. Create a Formula object instance by passing a formula string:</span>
<span class="hljs-keyword">const</span> fObj = <span class="hljs-keyword">new</span> Formula(<span class="hljs-string">&#x27;2^x&#x27;</span>);

<span class="hljs-comment">// 2. evaluate the formula, delivering a value object for each unknown entity:</span>
<span class="hljs-keyword">let</span> result = fObj.evaluate({<span class="hljs-attr">x</span>: <span class="hljs-number">3</span>}); <span class="hljs-comment">// result = 8</span>

<span class="hljs-comment">// or deliver multiple value objects to return multiple results:</span>
<span class="hljs-keyword">let</span> results = fObj.evaluate([{<span class="hljs-attr">x</span>: <span class="hljs-number">2</span>},{<span class="hljs-attr">x</span>: <span class="hljs-number">4</span>},{<span class="hljs-attr">x</span>: <span class="hljs-number">8</span>}]); <span class="hljs-comment">// results = [4,16,256]</span>

<span class="hljs-comment">// You can also directly evaluate a value if you only need a one-shot result:</span>
<span class="hljs-keyword">let</span> result = Formula.calc(<span class="hljs-string">&#x27;2^x&#x27;</span>,{<span class="hljs-attr">x</span>: <span class="hljs-number">3</span>}); <span class="hljs-comment">// result = 8</span>
<span class="hljs-keyword">let</span> results = fObj.calc(<span class="hljs-string">&#x27;2^x&#x27;</span>,[{<span class="hljs-attr">x</span>: <span class="hljs-number">2</span>},{<span class="hljs-attr">x</span>: <span class="hljs-number">4</span>},{<span class="hljs-attr">x</span>: <span class="hljs-number">8</span>}]); <span class="hljs-comment">// results = [4,16,256]</span>

<span class="hljs-comment">// Usage in NodeJS:</span>
<span class="hljs-keyword">const</span> Formula = <span class="hljs-built_in">require</span>(<span class="hljs-string">&#x27;fparser&#x27;</span>);
<span class="hljs-keyword">const</span> fObj = <span class="hljs-keyword">new</span> Formula(<span class="hljs-string">&#x27;2^x)&#x27;</span>);
<span class="hljs-comment">// .... vice versa</span>
</div></code></pre>
                </div>
            </div>
            <div class="card mt-3">
                <div class="card-header">
                    <h2 id="usage">Usage</h2>
                </div>
                <div class="card-body">
                    <h2 id="more-options">More options</h2>
                    <h3 id="using-multiple-variables">Using multiple variables</h3>
                    <pre><code class="language-javascript"><div><span class="hljs-keyword">const</span> fObj = <span class="hljs-keyword">new</span> Formula(<span class="hljs-string">&#x27;a*x^2 + b*x + c&#x27;</span>);

<span class="hljs-comment">// Just pass a value object containing a value for each unknown variable:</span>
<span class="hljs-keyword">let</span> result = fObj.evaluate({<span class="hljs-attr">a</span>:<span class="hljs-number">2</span>,<span class="hljs-attr">b</span>:<span class="hljs-number">-1</span>,<span class="hljs-attr">c</span>:<span class="hljs-number">3</span>,<span class="hljs-attr">x</span>:<span class="hljs-number">3</span>}); <span class="hljs-comment">// result = 18</span>
</div></code></pre>
                    <h3 id="using-named-variables">Using named variables</h3>
                    <p>
                        Instead of single-char variables (like <code>2x+y</code>), you can also use named variables in
                        brackets:
                    </p>
                    <pre><code class="language-javascript"><div><span class="hljs-keyword">const</span> fObj = <span class="hljs-keyword">new</span> Formula(<span class="hljs-string">&#x27;2*[var1] + sin([var2]+PI)&#x27;</span>);

<span class="hljs-comment">// Just pass a value object containing a value for each named variable:</span>
<span class="hljs-keyword">let</span> result = fObj.evaluate({<span class="hljs-attr">var1</span>: <span class="hljs-number">5</span>, <span class="hljs-attr">var2</span>: <span class="hljs-number">0.7</span>});
</div></code></pre>
                    <h3 id="using-user-defined-functions">Using user-defined functions</h3>
                    <pre><code class="language-javascript"><div><span class="hljs-keyword">const</span> fObj = <span class="hljs-keyword">new</span> Formula(<span class="hljs-string">&#x27;sin(inverse(x))&#x27;</span>);

<span class="hljs-comment">//Define the function(s) on the Formula object, then use it multiple times:</span>
fObj.inverse = <span class="hljs-function">(<span class="hljs-params">value</span>) =&gt;</span> <span class="hljs-number">1</span>/value;
<span class="hljs-keyword">let</span> results = fObj.evaluate({<span class="hljs-attr">x</span>: <span class="hljs-number">1</span>,<span class="hljs-attr">x</span>:<span class="hljs-number">2</span>,<span class="hljs-attr">x</span>:<span class="hljs-number">3</span>});

<span class="hljs-comment">// Or pass it in the value object, and OVERRIDE an existing function:</span>
<span class="hljs-keyword">let</span> result = fObj.evaluate({
	<span class="hljs-attr">x</span>: <span class="hljs-number">2</span>/<span class="hljs-built_in">Math</span>.PI,
	<span class="hljs-attr">inverse</span>: <span class="hljs-function">(<span class="hljs-params">value</span>) =&gt;</span>  (<span class="hljs-number">-1</span>*value)
});

If defined <span class="hljs-keyword">in</span> the value object AND on the formula object, the Value object has the precedence
</div></code></pre>
                    <h3 id="re-use-a-formula-object">Re-use a Formula object</h3>
                    <p>
                        You can instantiate a Formula object without formula, and set it later, and even re-use the
                        existing object:
                    </p>
                    <pre><code class="language-javascript"><div><span class="hljs-keyword">const</span> fObj = <span class="hljs-keyword">new</span> Formula();
<span class="hljs-comment">// ...</span>
fObj.setFormula(<span class="hljs-string">&#x27;2*x^2 + 5*x + 3&#x27;</span>);
<span class="hljs-keyword">let</span> res = fObj.evaluate({<span class="hljs-attr">x</span>:<span class="hljs-number">3</span>});
<span class="hljs-comment">// ...</span>
fObj.setFormula(<span class="hljs-string">&#x27;x*y&#x27;</span>);
res = fObj.evaluate({<span class="hljs-attr">x</span>:<span class="hljs-number">2</span>, <span class="hljs-attr">y</span>:<span class="hljs-number">4</span>});
</div></code></pre>
                    <h3 id="memoization">Memoization</h3>
                    <p>
                        To avoid re-calculation of already evaluated results, the formula parser object supports
                        <strong>memoization</strong>: it stores already evaluated results for given expression
                        parameters.
                    </p>
                    <p>Example:</p>
                    <pre><code class="language-javascript"><div><span class="hljs-keyword">const</span> fObj = <span class="hljs-keyword">new</span> Formula(<span class="hljs-string">&#x27;x * y&#x27;</span>, {<span class="hljs-attr">memoization</span>: <span class="hljs-literal">true</span>});
<span class="hljs-keyword">let</span> res1 = fObj.evaluate({<span class="hljs-attr">x</span>:<span class="hljs-number">2</span>, <span class="hljs-attr">y</span>:<span class="hljs-number">3</span>}); <span class="hljs-comment">// 6, evaluated by calculating x*y</span>
<span class="hljs-keyword">let</span> res2 = fObj.evaluate({<span class="hljs-attr">x</span>:<span class="hljs-number">2</span>, <span class="hljs-attr">y</span>:<span class="hljs-number">3</span>}); <span class="hljs-comment">// 6, from memory</span>
</div></code></pre>
                    <p>You can enable / disable memoization on the object:</p>
                    <pre><code class="language-javascript"><div><span class="hljs-keyword">const</span> fObj = <span class="hljs-keyword">new</span> Formula(<span class="hljs-string">&#x27;x * y&#x27;</span>);
<span class="hljs-keyword">let</span> res1 = fObj.evaluate({<span class="hljs-attr">x</span>:<span class="hljs-number">2</span>, <span class="hljs-attr">y</span>:<span class="hljs-number">3</span>}); <span class="hljs-comment">// 6, evaluated by calculating x*y</span>
fObj.enableMemoization();
<span class="hljs-keyword">let</span> res2 = fObj.evaluate({<span class="hljs-attr">x</span>:<span class="hljs-number">2</span>, <span class="hljs-attr">y</span>:<span class="hljs-number">3</span>}); <span class="hljs-comment">// 6, evaluated by calculating x*y</span>
<span class="hljs-keyword">let</span> res3 = fObj.evaluate({<span class="hljs-attr">x</span>:<span class="hljs-number">2</span>, <span class="hljs-attr">y</span>:<span class="hljs-number">3</span>}); <span class="hljs-comment">// 6, from memory</span>
</div></code></pre>
                    <h3 id="get-all-used-variables">Get all used variables</h3>
                    <pre><code class="language-javascript"><div><span class="hljs-comment">// Get all used variables in the order of their appereance:</span>
<span class="hljs-keyword">const</span> f4 = <span class="hljs-keyword">new</span> Formula(<span class="hljs-string">&#x27;x*sin(PI*y) + y / (2-x*[var1]) + [var2]&#x27;</span>);
<span class="hljs-built_in">console</span>.log(f4.getVariables()); <span class="hljs-comment">// [&#x27;x&#x27;,&#x27;y&#x27;,&#x27;var1&#x27;,&#x27;var2&#x27;]</span>
</div></code></pre>
                    <h3 id="get-the-parsed-formula-string">Get the parsed formula string</h3>
                    <p>After parsing, get the formula string as parsed:</p>
                    <pre><code class="language-javascript"><div><span class="hljs-comment">// Get all used variables in the order of their appereance:</span>
<span class="hljs-keyword">const</span> f = <span class="hljs-keyword">new</span> Formula(<span class="hljs-string">&#x27;x      * (  y  +    9 )&#x27;</span>);
<span class="hljs-built_in">console</span>.log(f.getExpressionString()); <span class="hljs-comment">// &#x27;x * (y + 9)&#x27;</span>
</div></code></pre>
                </div>
            </div>
        </div>

        <footer class="border p-3">(c) 2021 <a href="mailto:alex@alexi.ch">Alexander Schenkel</a></footer>
    </div>
</template>

<script>
import Fparser from '@/../../src/fparser';
import Chart from 'chart.js/auto';

let chart = null;

export default {
    name: 'App',
    data: function () {
        return {
            error: null,
            formula: '1/log(2^(x))*sin(x/PI)',
            formulas: ['1/log(2^(x))*sin(x/PI)', '-1*sin(x/PI)*(1/x)', '0.05*sin(x/PI/4)*cos(x/3)'],
            manualFormula: null,
            minX: '0',
            maxX: '30*PI',
            minY: '-0.3',
            maxY: '0.6',
            xInc: 'PI/4',
            result: null,
            singleVar: {},
            singleError: null
        };
    },
    computed: {
        formulaObject() {
            if (this.manualFormula) {
                try {
                    return new Fparser(this.manualFormula);
                } catch (e) {
                    return null;
                }
            } else {
                return null;
            }
        }
    },
    components: {},
    watch: {
        formulas(f) {
            if (f.length > 0) {
                this.redrawDiagram();
            }
        }
    },
    mounted() {
        this.selectedFormula = this.formulas[0];
        this.setupDiagram();
    },
    methods: {
        setupDiagram() {
            chart = new Chart(this.$refs.chart, {
                type: 'scatter',
                options: {
                    showLine: true,
                    // borderColor: 'blue',
                    tension: 0.1
                }
            });
            this.redrawDiagram();
        },
        redrawDiagram() {
            this.error = null;
            try {
                let fparser = new Fparser();

                let maxX = Fparser.calc(this.maxX);
                let minX = Fparser.calc(this.minX);
                let maxY = Fparser.calc(this.maxY);
                let minY = Fparser.calc(this.minY);
                let xInc = Fparser.calc(this.xInc);

                chart.options.scales['x'].min = minX;
                chart.options.scales['x'].max = maxX;
                chart.options.scales['y'].min = minY;
                chart.options.scales['y'].max = maxY;
                chart.data.datasets = [];
                this.formulas.forEach((formula) => {
                    let dataset = {
                        label: formula,
                        borderColor: `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`,
                        data: []
                    };
                    for (let xi = minX; xi <= maxX; xi += xInc) {
                        dataset.data.push({ x: xi, y: fparser.setFormula(formula).evaluate({ x: xi }) });
                    }
                    chart.data.datasets.push(dataset);
                });

                chart.update();
            } catch (e) {
                this.error = String(e);
            }
        },
        addFormula() {
            this.error = null;
            try {
                new Fparser(this.formula);

                this.formulas = [...this.formulas, this.formula].filter((v, i, a) => a.indexOf(v) === i);
            } catch (e) {
                this.error = String(e);
            }
        },
        removeFormula(formula) {
            this.formulas = this.formulas.filter((v) => v !== formula);
        },
        getVariables(formulaObject) {
            return formulaObject.getVariables().filter((v) => Object.keys(Fparser.MATH_CONSTANTS).indexOf(v) === -1);
        },
        calcSingleValue() {
            this.singleError = null;
            try {
                let res = Fparser.calc(this.manualFormula, this.singleVar);
                this.result = res;
            } catch (e) {
                this.singleError = String(e);
            }
        }
    }
};
</script>

<style lang="scss">
.card-header {
    font-weight: bold;
}
pre {
    background-color: #f3f3f3;
    color: #333;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 10px;
}
</style>
