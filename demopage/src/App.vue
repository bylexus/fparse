<template>
  <div>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container-fluid bg-dark bg-gradient text-white">
        <h1>fparser - A JavaScript Formula parser library</h1>
      </div>
    </nav>
    <div class="container-fluid">
      <p>
        fparser is a Formula parser library for JavaScript - it parses mathematical equations from
        strings, and evaluates them to numbers.
      </p>
      <p>
        <a href="https://github.com/bylexus/fparse">@see the github page</a> for a more detailed
        usage documentation.<br />
        The source code of this page can be found
        <a href="https://github.com/bylexus/fparse/blob/develop/demopage/src/App.vue">here</a>.
      </p>

      <p>
        This page just demonstrate its usage in a real-life application. Play around with adding
        formulas and modify the diagram parameters - fparser will draw the diagram for you.
      </p>

      <h2>Features</h2>
      <p>Parses a mathematical formula from a string. Known expressions:</p>

      <ul>
        <li><em>Numbers</em> in the form [-]digits[.digits], e.g. &quot;-133.2945&quot;</li>
        <li><em>simple operators</em>: '+','-','*','/', '^' expanded in correct order</li>
        <li>
          <em>logical operators</em>: '&lt;','&lt;=','&gt;','&gt;=', '=', '!=', which evaluate to 1
          or 0. Useful for implementing conditional logic
        </li>
        <li><em>parentheses</em> '(', ')' for grouping (e.g. &quot;5*(3+2)&quot;)</li>
        <li>all <em>JavaScript Math object functions</em> (e.g. &quot;sin(3.14)&quot;)</li>
        <li>all <em>JavaScript Math constants</em> like PI, E</li>
        <li>the use of <em>own functions</em></li>
        <li>the use of single-char <em>variables</em> (like '2x')</li>
        <li>the use of named variables (like '2*[myVar]')</li>
        <li>
          the use of strings as function arguments (like 'concat(&quot;Size: &quot;, 2, &quot;
          mm&quot;)')
        </li>
        <li>
          the use of strings as variables (like 'concat(&quot;Size: &quot;, 2, &quot; &quot;,
          [unit])')
        </li>
        <li>
          the use of path named variables and functions (like '2*[myVar.property.innerProperty]')
        </li>
        <li><em>memoization</em>: store already evaluated results for faster re-calcs</li>
        <li>use it in Web pages, as ES6 module or as NodeJS module</li>
        <li>
          Example:<br />
          <code>-1*(sin(2^x)/(PI*x))*cos(x)</code>
        </li>
      </ul>

      <h2>Demo Application</h2>
      <div class="row">
        <div class="col-12 col-lg-4">
          <div class="card">
            <div class="card-header">
              Enter formula <small>(Note: just use 'x' as variable)</small>:
            </div>
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
                      Value for {{ variable }}:
                    </label>
                    <input
                      v-model="singleVar[variable]"
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
<p>Include directly in your web page:</p>
<pre><code class="language-html"><span class="hljs-comment">&lt;!-- Within a web page: Load the fparser library: --&gt;</span>
<span class="hljs-tag">&lt;<span class="hljs-name">script</span> <span class="hljs-attr">src</span>=<span class="hljs-string">&quot;dist/fparser.js&quot;</span>&gt;</span><span class="hljs-tag">&lt;/<span class="hljs-name">script</span>&gt;</span>
<span class="hljs-tag">&lt;<span class="hljs-name">script</span>&gt;</span><span class="language-javascript"><span class="hljs-keyword">const</span> f = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Formula</span>(<span class="hljs-string">&#x27;x+3&#x27;</span>);</span><span class="hljs-tag">&lt;/<span class="hljs-name">script</span>&gt;</span>
</code></pre>
<p>Install it from <a href="http://npmjs.org">npmjs.org</a>:</p>
<pre><code class="language-shell"><span class="hljs-meta prompt_"># </span><span class="language-bash">Install it using npm:</span>
<span class="hljs-meta prompt_">$ </span><span class="language-bash">npm install --save fparser</span>
</code></pre>
<p>Then use as ES6 module (recommended):</p>
<pre><code class="language-javascript"><span class="hljs-keyword">import</span> <span class="hljs-title class_">Formula</span> <span class="hljs-keyword">from</span> <span class="hljs-string">&#x27;fparser&#x27;</span>;
</code></pre>
<p>or use it as UMD module:</p>
<pre><code class="language-javascript"><span class="hljs-keyword">const</span> <span class="hljs-title class_">Formula</span> = <span class="hljs-built_in">require</span>(<span class="hljs-string">&#x27;fparser&#x27;</span>);
</code></pre>
<p>... and finally use it:</p>
<pre><code class="language-javascript"><span class="hljs-comment">// 1. Create a Formula object instance by passing a formula string:</span>
<span class="hljs-keyword">const</span> fObj = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Formula</span>(<span class="hljs-string">&#x27;2^x&#x27;</span>);

<span class="hljs-comment">// 2. evaluate the formula, delivering a value object for each unknown entity:</span>
<span class="hljs-keyword">let</span> result = fObj.evaluate({ <span class="hljs-attr">x</span>: <span class="hljs-number">3</span> }); <span class="hljs-comment">// result = 8</span>

<span class="hljs-comment">// or deliver multiple value objects to return multiple results:</span>
<span class="hljs-keyword">let</span> results = fObj.evaluate([{ <span class="hljs-attr">x</span>: <span class="hljs-number">2</span> }, { <span class="hljs-attr">x</span>: <span class="hljs-number">4</span> }, { <span class="hljs-attr">x</span>: <span class="hljs-number">8</span> }]); <span class="hljs-comment">// results = [4,16,256]</span>

<span class="hljs-comment">// You can also directly evaluate a value if you only need a one-shot result:</span>
<span class="hljs-keyword">let</span> result = <span class="hljs-title class_">Formula</span>.<span class="hljs-title function_">calc</span>(<span class="hljs-string">&#x27;2^x&#x27;</span>, { <span class="hljs-attr">x</span>: <span class="hljs-number">3</span> }); <span class="hljs-comment">// result = 8</span>
<span class="hljs-keyword">let</span> results = <span class="hljs-title class_">Formula</span>.<span class="hljs-title function_">calc</span>(<span class="hljs-string">&#x27;2^x&#x27;</span>, [{ <span class="hljs-attr">x</span>: <span class="hljs-number">2</span> }, { <span class="hljs-attr">x</span>: <span class="hljs-number">4</span> }, { <span class="hljs-attr">x</span>: <span class="hljs-number">8</span> }]); <span class="hljs-comment">// results = [4,16,256]</span>
</code></pre>
<h2 id="more-options">More options</h2>
<h3 id="using-multiple-variables">Using multiple variables</h3>
<pre><code class="language-javascript"><span class="hljs-keyword">const</span> fObj = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Formula</span>(<span class="hljs-string">&#x27;a*x^2 + b*x + c&#x27;</span>);

<span class="hljs-comment">// Just pass a value object containing a value for each unknown variable:</span>
<span class="hljs-keyword">let</span> result = fObj.evaluate({ <span class="hljs-attr">a</span>: <span class="hljs-number">2</span>, <span class="hljs-attr">b</span>: -<span class="hljs-number">1</span>, <span class="hljs-attr">c</span>: <span class="hljs-number">3</span>, <span class="hljs-attr">x</span>: <span class="hljs-number">3</span> }); <span class="hljs-comment">// result = 18</span>
</code></pre>
<h3 id="using-named-variables">Using named variables</h3>
<p>Instead of single-char variables (like <code>2x+y</code>), you can also use named variables in brackets:</p>
<pre><code class="language-javascript"><span class="hljs-keyword">const</span> fObj = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Formula</span>(<span class="hljs-string">&#x27;2*[var1] + sin([var2]+PI)&#x27;</span>);

<span class="hljs-comment">// Just pass a value object containing a value for each named variable:</span>
<span class="hljs-keyword">let</span> result = fObj.evaluate({ <span class="hljs-attr">var1</span>: <span class="hljs-number">5</span>, <span class="hljs-attr">var2</span>: <span class="hljs-number">0.7</span> });
</code></pre>
<p>The reason for the bracket syntax is the support of shortcut multiplication of single vars, e.g. <code>2xy</code> is a shorthand for <code>2*x*y</code>. As the parser cannot decide if <code>xy</code> means &quot;the variable named <code>xy&quot;, or </code>calc x*y`, we had to introduce the
bracket syntax.</p>
<h3 id="using-named-object-path-variables">Using named object path variables</h3>
<p>Named variables in brackets can also describe an object property path:</p>
<pre><code class="language-javascript"><span class="hljs-keyword">const</span> fObj = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Formula</span>(<span class="hljs-string">&#x27;2*[var1.propertyA] + 3*[var2.propertyB.propertyC]&#x27;</span>);

<span class="hljs-comment">// Just pass a value object containing a value for each named variable:</span>
<span class="hljs-keyword">let</span> result = fObj.evaluate({ <span class="hljs-attr">var1</span>: { <span class="hljs-attr">propertyA</span>: <span class="hljs-number">3</span> }, <span class="hljs-attr">var2</span>: { <span class="hljs-attr">propertyB</span>: { <span class="hljs-attr">propertyC</span>: <span class="hljs-number">9</span> } } });
</code></pre>
<p>This even works for array values: Instead of the property name, use a 0-based index in an array:</p>
<pre><code class="language-javascript"><span class="hljs-comment">// var2.propertyB is an array, so we can use an index for the 3rd entry of propertyB:</span>
<span class="hljs-keyword">const</span> fObj = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Formula</span>(<span class="hljs-string">&#x27;2*[var1.propertyA] + 3*[var2.propertyB.2]&#x27;</span>);
<span class="hljs-keyword">let</span> result = fObj.evaluate({ <span class="hljs-attr">var1</span>: { <span class="hljs-attr">propertyA</span>: <span class="hljs-number">3</span> }, <span class="hljs-attr">var2</span>: { <span class="hljs-attr">propertyB</span>: [<span class="hljs-number">2</span>, <span class="hljs-number">4</span>, <span class="hljs-number">6</span>] } });
</code></pre>
<h3 id="using-user-defined-functions">Using user-defined functions</h3>
<pre><code class="language-javascript"><span class="hljs-keyword">const</span> fObj = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Formula</span>(<span class="hljs-string">&#x27;sin(inverse(x))&#x27;</span>);

<span class="hljs-comment">//Define the function(s) on the Formula object, then use it multiple times:</span>
fObj.<span class="hljs-property">inverse</span> = <span class="hljs-function">(<span class="hljs-params">value</span>) =&gt;</span> <span class="hljs-number">1</span>/value;
<span class="hljs-keyword">let</span> results = fObj.evaluate([{ <span class="hljs-attr">x</span>: <span class="hljs-number">1</span> }, { <span class="hljs-attr">x</span>: <span class="hljs-number">2</span> }, { <span class="hljs-attr">x</span>: <span class="hljs-number">3</span> }]);

<span class="hljs-comment">// Or pass it in the value object, and OVERRIDE an existing function:</span>
<span class="hljs-keyword">let</span> result = fObj.evaluate({
	<span class="hljs-attr">x</span>: <span class="hljs-number">2</span>/<span class="hljs-title class_">Math</span>.<span class="hljs-property">PI</span>,
	<span class="hljs-attr">inverse</span>: <span class="hljs-function">(<span class="hljs-params">value</span>) =&gt;</span>  (-<span class="hljs-number">1</span>*value)
});

</code></pre>
<p>If the function is defined in the value object AND on the formula object, the Value object has precedence</p>
<p>Functions also support the object path syntax:</p>
<pre><code class="language-javascript"><span class="hljs-comment">// in an evaluate() value object:</span>
<span class="hljs-keyword">const</span> fObj = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Formula</span>(<span class="hljs-string">&#x27;sin(lib.inverse([lib.x]))&#x27;</span>);
<span class="hljs-keyword">const</span> res = fObj.evaluate({
	<span class="hljs-attr">lib</span>: { <span class="hljs-attr">inverse</span>: <span class="hljs-function">(<span class="hljs-params">value</span>) =&gt;</span> <span class="hljs-number">1</span> / value, <span class="hljs-attr">x</span>: <span class="hljs-title class_">Math</span>.<span class="hljs-property">PI</span> }
});

<span class="hljs-comment">// or set it on the Formula instance:</span>
<span class="hljs-keyword">const</span> fObj2 = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Formula</span>(<span class="hljs-string">&#x27;sin(lib.inverse(x))&#x27;</span>);
fObj2.<span class="hljs-property">lib</span> = { <span class="hljs-attr">inverse</span>: <span class="hljs-function">(<span class="hljs-params">value</span>) =&gt;</span> <span class="hljs-number">1</span> / value };
<span class="hljs-keyword">const</span> res2 = fObj2.evaluate({ <span class="hljs-attr">x</span>: <span class="hljs-title class_">Math</span>.<span class="hljs-property">PI</span> });
</code></pre>
<h3 id="using-strings">Using strings</h3>
<p>You can also pass strings as values or variable values (not only numbers): It is then in your responsibility to
provide a function that can make sense of the string:</p>
<p>E.g. you can create a function that concats 2 values:</p>
<pre><code class="language-javascript"><span class="hljs-keyword">const</span> fObj = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Formula</span>(<span class="hljs-string">&#x27;concat([var1], &quot;Bar&quot;)&#x27;</span>);
<span class="hljs-keyword">let</span> result = fObj.evaluate({ <span class="hljs-attr">var1</span>: <span class="hljs-string">&#x27;Foo&#x27;</span>, <span class="hljs-attr">concat</span>: <span class="hljs-function">(<span class="hljs-params">s1, s2</span>) =&gt;</span> s1 + s2 });
</code></pre>
<p>Here, the result of the evaluation is again a string.</p>
<p>Of course you can use strings to make decisions: Here, we provide a function <code>longer</code> that
returns the length of the longer of two strings, and calculates the remaining length:</p>
<pre><code class="language-javascript"><span class="hljs-keyword">const</span> fObj = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Formula</span>(<span class="hljs-string">&#x27;20 - longer([var1], &quot;Bar&quot;)&#x27;</span>);
<span class="hljs-keyword">let</span> result = fObj.evaluate({ <span class="hljs-attr">var1</span>: <span class="hljs-string">&#x27;FooBar&#x27;</span>, <span class="hljs-attr">longer</span>: <span class="hljs-function">(<span class="hljs-params">s1, s2</span>) =&gt;</span> s1.<span class="hljs-property">length</span> &gt; s2.<span class="hljs-property">length</span> ? s1.<span class="hljs-property">length</span> : s2.<span class="hljs-property">length</span> });
<span class="hljs-comment">// --&gt; 14</span>
</code></pre>
<h3 id="using-logical-operators">Using logical operators</h3>
<p>Logical operators allow for conditional logic. The result of the evaluation is always <code>0</code> (expression is false) or <code>1</code> (expression is true).</p>
<p>Example:</p>
<p>Calculate a percentage value based on a variable <code>x</code>, but only if <code>x</code> is between 0 and 1:</p>
<pre><code class="language-javascript"><span class="hljs-keyword">const</span> fObj = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Formula</span>(<span class="hljs-string">&#x27;(x &gt;= 0) * (x &lt;= 1) * x * 100&#x27;</span>);
<span class="hljs-keyword">let</span> result = fObj.evaluate([{ <span class="hljs-attr">x</span>: <span class="hljs-number">0.5</span> }, { <span class="hljs-attr">x</span>: <span class="hljs-number">0.7</span> }, { <span class="hljs-attr">x</span>: <span class="hljs-number">1.5</span> },  { <span class="hljs-attr">x</span>: -<span class="hljs-number">0.5</span> }, { <span class="hljs-attr">x</span>: -<span class="hljs-number">1.7</span> }]);
<span class="hljs-comment">// --&gt; [50, 70, 0, 0, 0]</span>
</code></pre>
<p>This could be used to simulate or &quot;shortcut&quot; comparison functions. The same could be achieved with a user-definded function:</p>
<pre><code class="language-javascript"><span class="hljs-keyword">const</span> fObj = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Formula</span>(<span class="hljs-string">&#x27;withinOne(x) * 100&#x27;</span>);
fObj.<span class="hljs-property">withinOne</span> = <span class="hljs-function">(<span class="hljs-params">x</span>) =&gt;</span> (x &gt;= <span class="hljs-number">0</span> &amp;&amp; x &lt;= <span class="hljs-number">1</span> ? x : <span class="hljs-number">0</span>);
<span class="hljs-keyword">let</span> result = fObj.evaluate([{ <span class="hljs-attr">x</span>: <span class="hljs-number">0.5</span> }, { <span class="hljs-attr">x</span>: <span class="hljs-number">0.7</span> }, { <span class="hljs-attr">x</span>: <span class="hljs-number">1.5</span> },  { <span class="hljs-attr">x</span>: -<span class="hljs-number">0.5</span> }, { <span class="hljs-attr">x</span>: -<span class="hljs-number">1.7</span> }]);
<span class="hljs-comment">// --&gt; [50, 70, 0, 0, 0]</span>
</code></pre>
<p><strong>NOTE</strong>: Logical operators have the LEAST precedence: <code>3 &gt; 1 + 4 &lt; 2</code> is evaluated as <code>3 &gt; (1+4) &lt; 2</code>.</p>
<h3 id="conditional-evaluation">Conditional evaluation</h3>
<p>The previous chapter introduced logical operators. This can be used to implement a conditional function, or <code>if</code> function:</p>
<p>Example: Kids get a 50% discount on a price if they are under 18:</p>
<pre><code class="language-javascript"><span class="hljs-keyword">const</span> fObj = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Formula</span>(<span class="hljs-string">&#x27;ifElse([age] &lt; 18, [price]*0.5, [price])&#x27;</span>);
<span class="hljs-keyword">const</span> res = fObj.evaluate([{ <span class="hljs-attr">price</span>: <span class="hljs-number">100</span>, <span class="hljs-attr">age</span>: <span class="hljs-number">17</span> }, { <span class="hljs-attr">price</span>: <span class="hljs-number">100</span>, <span class="hljs-attr">age</span>: <span class="hljs-number">20</span> }]);
<span class="hljs-comment">// --&gt; res = [50, 100]</span>
</code></pre>
<h3 id="re-use-a-formula-object">Re-use a Formula object</h3>
<p>You can instantiate a Formula object without formula, and set it later, and even re-use the existing object:</p>
<pre><code class="language-javascript"><span class="hljs-keyword">const</span> fObj = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Formula</span>();
<span class="hljs-comment">// ...</span>
fObj.<span class="hljs-title function_">setFormula</span>(<span class="hljs-string">&#x27;2*x^2 + 5*x + 3&#x27;</span>);
<span class="hljs-keyword">let</span> res = fObj.evaluate({ <span class="hljs-attr">x</span>: <span class="hljs-number">3</span> });
<span class="hljs-comment">// ...</span>
fObj.<span class="hljs-title function_">setFormula</span>(<span class="hljs-string">&#x27;x*y&#x27;</span>);
res = fObj.evaluate({ <span class="hljs-attr">x</span>: <span class="hljs-number">2</span>, <span class="hljs-attr">y</span>: <span class="hljs-number">4</span> });
</code></pre>
<h3 id="memoization">Memoization</h3>
<p>To avoid re-calculation of already evaluated results, the formula parser object supports <strong>memoization</strong>:
it stores already evaluated results for given expression parameters.</p>
<p>Example:</p>
<pre><code class="language-javascript"><span class="hljs-keyword">const</span> fObj = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Formula</span>(<span class="hljs-string">&#x27;x * y&#x27;</span>, { <span class="hljs-attr">memoization</span>: <span class="hljs-literal">true</span> });
<span class="hljs-keyword">let</span> res1 = fObj.evaluate({ <span class="hljs-attr">x</span>: <span class="hljs-number">2</span>, <span class="hljs-attr">y</span>: <span class="hljs-number">3</span> }); <span class="hljs-comment">// 6, evaluated by calculating x*y</span>
<span class="hljs-keyword">let</span> res2 = fObj.evaluate({ <span class="hljs-attr">x</span>: <span class="hljs-number">2</span>, <span class="hljs-attr">y</span>: <span class="hljs-number">3</span> }); <span class="hljs-comment">// 6, from memory</span>
</code></pre>
<p>You can enable / disable memoization on the object:</p>
<pre><code class="language-javascript"><span class="hljs-keyword">const</span> fObj = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Formula</span>(<span class="hljs-string">&#x27;x * y&#x27;</span>);
<span class="hljs-keyword">let</span> res1 = fObj.evaluate({ <span class="hljs-attr">x</span>: <span class="hljs-number">2</span>, <span class="hljs-attr">y</span>: <span class="hljs-number">3</span> }); <span class="hljs-comment">// 6, evaluated by calculating x*y</span>
fObj.<span class="hljs-title function_">enableMemoization</span>();
<span class="hljs-keyword">let</span> res2 = fObj.evaluate({ <span class="hljs-attr">x</span>: <span class="hljs-number">2</span>, <span class="hljs-attr">y</span>: <span class="hljs-number">3</span> }); <span class="hljs-comment">// 6, evaluated by calculating x*y</span>
<span class="hljs-keyword">let</span> res3 = fObj.evaluate({ <span class="hljs-attr">x</span>: <span class="hljs-number">2</span>, <span class="hljs-attr">y</span>: <span class="hljs-number">3</span> }); <span class="hljs-comment">// 6, from memory</span>
</code></pre>
<h3 id="blacklisted-functions">Blacklisted functions</h3>
<p>The <code>Formula</code> class blacklists its internal functions like <code>evaluate</code>, <code>parse</code> etc. You cannot create a formula that calls an internal <code>Formula</code>
function:</p>
<pre><code class="language-javascript"><span class="hljs-comment">// Internal functions cannot be used in formulas:</span>
<span class="hljs-keyword">const</span> fObj = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Formula</span>(<span class="hljs-string">&#x27;evaluate(x)&#x27;</span>);
fObj.evaluate({ <span class="hljs-attr">x</span>: <span class="hljs-number">5</span> }); <span class="hljs-comment">// throws an Error</span>

<span class="hljs-comment">// This also counts for function aliases / references to internal functions:</span>
<span class="hljs-keyword">const</span> fObj = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Formula</span>(<span class="hljs-string">&#x27;ex(x)&#x27;</span>);
fObj.<span class="hljs-property">ex</span> = fObj.<span class="hljs-property">evaluate</span>;
fObj.evaluate({ <span class="hljs-attr">x</span>: <span class="hljs-number">5</span> }); <span class="hljs-comment">// still throws an Error: ex is an alias of evaluate</span>
</code></pre>
<p>The <code>Formula</code> object keeps a function reference of all blacklisted functions in the <code>Formula.functionBlacklist</code> array.</p>
<p>You can get a list of all blacklisted functions:</p>
<pre><code class="language-javascript"><span class="hljs-keyword">let</span> blacklistNames = <span class="hljs-title class_">Formula</span>.<span class="hljs-property">functionBlacklist</span>.<span class="hljs-title function_">map</span>(<span class="hljs-function">(<span class="hljs-params">f</span>) =&gt;</span> f.<span class="hljs-property">name</span>));
</code></pre>
<p>Or you can check if a specific function is in the blacklist:</p>
<pre><code class="language-javascript">fObj = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Formula</span>(<span class="hljs-string">&#x27;x * y&#x27;</span>);
<span class="hljs-comment">// fObj.evaluate is a Function pointer to an internal, blacklisted function:</span>
<span class="hljs-title class_">Formula</span>.<span class="hljs-property">functionBlacklist</span>.<span class="hljs-title function_">includes</span>(fObj.<span class="hljs-property">evaluate</span>);
</code></pre>
<p>If you want to provide your own function for a blacklisted internal function,
provide it with the <code>evaluate</code> function:</p>
<pre><code class="language-javascript">fObj = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Formula</span>(<span class="hljs-string">&#x27;evaluate(x * y)&#x27;</span>);
fObj.evaluate({ <span class="hljs-attr">x</span>: <span class="hljs-number">1</span>, <span class="hljs-attr">y</span>: <span class="hljs-number">2</span>, <span class="hljs-attr">evaluate</span>: <span class="hljs-function">(<span class="hljs-params">x, y</span>) =&gt;</span> x + y });
</code></pre>
<p>Now, <code>evaluate</code> in your formula uses your own version of this function.</p>
<h3 id="get-all-used-variables">Get all used variables</h3>
<pre><code class="language-javascript"><span class="hljs-comment">// Get all used variables in the order of their appearance:</span>
<span class="hljs-keyword">const</span> f4 = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Formula</span>(<span class="hljs-string">&#x27;x*sin(PI*y) + y / (2-x*[var1]) + [var2]&#x27;</span>);
<span class="hljs-variable language_">console</span>.<span class="hljs-title function_">log</span>(f4.<span class="hljs-title function_">getVariables</span>()); <span class="hljs-comment">// [&#x27;x&#x27;,&#x27;PI&#x27;,&#x27;y&#x27;,&#x27;var1&#x27;,&#x27;var2&#x27;]</span>
</code></pre>
<h3 id="get-the-parsed-formula-string">Get the parsed formula string</h3>
<p>After parsing, get the formula string as parsed:</p>
<pre><code class="language-javascript"><span class="hljs-comment">// Get all used variables in the order of their appearance:</span>
<span class="hljs-keyword">const</span> f = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Formula</span>(<span class="hljs-string">&#x27;x      * (  y  +    9 )&#x27;</span>);
<span class="hljs-variable language_">console</span>.<span class="hljs-title function_">log</span>(f.<span class="hljs-title function_">getExpressionString</span>()); <span class="hljs-comment">// &#x27;x * (y + 9)&#x27;</span>
</code></pre>
<h2 id="pre-defined-functions">Pre-defined functions</h2>
<h3 id="ifelse"><code>ifElse</code></h3>
<p>The <code>ifElse</code> function is a functional implementation of the <code>if/else</code> statement:</p>
<p>If the predicate evaluates to true(-ish), the trueValue is returned, else the falseValue is returned:</p>
<pre><code class="language-javascript"><span class="hljs-comment">// If the given age is &lt; 18, give a 50% price reduction:</span>
<span class="hljs-keyword">const</span> fObj = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Formula</span>(<span class="hljs-string">&#x27;ifElse([age] &lt; 18, [price]*0.5, [price])&#x27;</span>);
<span class="hljs-keyword">const</span> res = fObj.evaluate([{ <span class="hljs-attr">price</span>: <span class="hljs-number">100</span>, <span class="hljs-attr">age</span>: <span class="hljs-number">17</span> }, { <span class="hljs-attr">price</span>: <span class="hljs-number">100</span>, <span class="hljs-attr">age</span>: <span class="hljs-number">20</span> }]);
</code></pre>
<p>In an imperative languate, this is equivalent to:</p>
<pre><code>if (age &lt; 18) {
	return price * 0.5;
} else {
	return price;
}
</code></pre>
<p>Because <code>ifElse</code> is just a function expression, you can even nest it. The next example also combines the
usage of object functions to check if a person is under 18, and goes to a supported school, then we give it a reduction:</p>
<pre><code class="language-javascript"><span class="hljs-keyword">const</span> fObj = <span class="hljs-keyword">new</span> <span class="hljs-title class_">Formula</span>(<span class="hljs-string">`
	ifElse([person.age] &lt; 18, 
		ifElse(schoolNames.includes([person.school]), 
			[price]*0.5, 
			[price]
		),
		[price]
	)
`</span>);
<span class="hljs-keyword">let</span> res = fObj.evaluate({
	<span class="hljs-attr">person</span>: { <span class="hljs-attr">age</span>: <span class="hljs-number">17</span>, <span class="hljs-attr">school</span>: <span class="hljs-string">&#x27;ABC Primary&#x27;</span> },
	<span class="hljs-attr">price</span>: <span class="hljs-number">100</span>,
	<span class="hljs-attr">schoolNames</span>: [<span class="hljs-string">&#x27;Local First&#x27;</span>, <span class="hljs-string">&#x27;ABC Primary&#x27;</span>, <span class="hljs-string">&#x27;Middleton High&#x27;</span>]
});
<span class="hljs-comment">// res = 50: the person is &lt; 18, and goes to a supported school, so we apply the reduced price.</span>
</code></pre>
<p>That almost feels like programming!</p>
        </div>
      </div>
    </div>

    <footer class="border p-3">
      (c) 2021-2024 <a href="mailto:alex@alexi.ch">Alexander Schenkel</a>
    </footer>
  </div>
</template>

<script>
import Fparser from '@/../../src/fparser'
import Chart from 'chart.js/auto'

let chart = null

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
    }
  },
  computed: {
    formulaObject() {
      if (this.manualFormula) {
        try {
          return new Fparser(this.manualFormula)
        } catch (e) {
          return null
        }
      } else {
        return null
      }
    }
  },
  components: {},
  watch: {
    formulas(f) {
      if (f.length > 0) {
        this.redrawDiagram()
      }
    }
  },
  mounted() {
    this.selectedFormula = this.formulas[0]
    this.setupDiagram()
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
      })
      this.redrawDiagram()
    },
    redrawDiagram() {
      this.error = null
      try {
        let fparser = new Fparser()

        let maxX = Fparser.calc(this.maxX)
        let minX = Fparser.calc(this.minX)
        let maxY = Fparser.calc(this.maxY)
        let minY = Fparser.calc(this.minY)
        let xInc = Fparser.calc(this.xInc)

        chart.options.scales['x'].min = minX
        chart.options.scales['x'].max = maxX
        chart.options.scales['y'].min = minY
        chart.options.scales['y'].max = maxY
        chart.data.datasets = []
        this.formulas.forEach((formula) => {
          let dataset = {
            label: formula,
            borderColor: `rgb(${Math.random() * 255},${Math.random() * 255},${
              Math.random() * 255
            })`,
            data: []
          }
          for (let xi = minX; xi <= maxX; xi += xInc) {
            dataset.data.push({ x: xi, y: fparser.setFormula(formula).evaluate({ x: xi }) })
          }
          chart.data.datasets.push(dataset)
        })

        chart.update()
      } catch (e) {
        this.error = String(e)
      }
    },
    addFormula() {
      this.error = null
      try {
        new Fparser(this.formula)

        this.formulas = [...this.formulas, this.formula].filter((v, i, a) => a.indexOf(v) === i)
      } catch (e) {
        this.error = String(e)
      }
    },
    removeFormula(formula) {
      this.formulas = this.formulas.filter((v) => v !== formula)
    },
    getVariables(formulaObject) {
      return formulaObject
        .getVariables()
        .filter((v) => Object.keys(Fparser.MATH_CONSTANTS).indexOf(v) === -1)
    },
    calcSingleValue() {
      this.singleError = null
      try {
        let res = Fparser.calc(this.manualFormula, this.singleVar)
        this.result = res
      } catch (e) {
        this.singleError = String(e)
      }
    }
  }
}
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
