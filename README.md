# jse-eval

[![Latest NPM release](https://img.shields.io/npm/v/jse-eval.svg)](https://www.npmjs.com/package/jse-eval)
[![License](https://img.shields.io/badge/license-MIT-007ec6.svg)](https://github.com/donmccurdy/jse-eval/blob/master/LICENSE)
[![CI](https://github.com/6utt3rfly/jse-eval/workflows/CI/badge.svg?branch=main&event=push)](https://github.com/6utt3rfly/jse-eval/actions?query=workflow%3ACI)
<!-- [![Minzipped size](https://badgen.net/bundlephobia/minzip/jse-eval)](https://bundlephobia.com/result?p=jse-eval) -->

## Credits
Heavily based on [expression-eval](https://github.com/donmccurdy/expression-eval) and [jsep](https://github.com/EricSmekens/jsep),
with thanks to their awesome work.

_Forked from [expression-eval](https://github.com/donmccurdy/expression-eval]) v5.0.0. Many thanks to @donmccurdy for the initial package_

**JavaScript expression parsing and evaluation.**

> **IMPORTANT:** As mentioned under [Security](#security) below, this library does not attempt to provide a secure sandbox for evaluation. Evaluation involving user inputs (expressions or values) may lead to unsafe behavior. If your project requires a secure sandbox, consider alternatives such as [vm2](https://www.npmjs.com/package/vm2).

- [Usage](#usage)
  * [Install](#install)
- [API](#api)
  * [Parsing](#parsing)
  * [Evaluation](#evaluation)
  * [Compilation](#compilation)
- [Extending evaluation](#extending-evaluation)
  * [Node Types Supported](#node-types-supported)
- [Related Packages](#related-packages)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)


## Usage
Evaluates an [estree](https://github.com/estree/estree) expression from [jsep](https://github.com/EricSmekens/jsep)
(as well as [@babel/parser](https://babeljs.io/docs/en/babel-parser), [esprima](https://esprima.org/),
[acorn](https://github.com/acornjs/acorn), or any other library that parses and returns a valid `estree` expression).


### Install

Install:

```
npm install --save jse-eval
```

Import:

```js
// ES6
import { parse, evaluate, compile, jsep } from 'jse-eval';

// CommonJS
const { parse, evaluate, compile, jsep } = require('jse-eval');

// UMD / standalone script
const { parse, evaluate, compile, jsep } = window.expressionEval;
```

## API

### Parsing

```javascript
import { parse } from 'jse-eval';
const ast = parse('1 + foo');
```

The result of the parse is an AST (abstract syntax tree), like:

```json
{
  "type": "BinaryExpression",
  "operator": "+",
  "left": {
    "type": "Literal",
    "value": 1,
    "raw": "1"
  },
  "right": {
    "type": "Identifier",
    "name": "foo"
  }
}
```

### Evaluation

```javascript
import { parse, evaluate } from 'jse-eval';
const ast = parse('a + b / c'); // abstract syntax tree (AST)
const value = eval(ast, {a: 2, b: 2, c: 5}); // 2.4

// alternatively:
const value = await evalAsync(ast, {a: 2, b: 2, c: 5}); // 2.4
```

### Compilation

```javascript
import { compile } from 'jse-eval';
const fn = compile('foo.bar + 10');
fn({foo: {bar: 'baz'}}); // 'baz10'

// alternatively:
import { compileAsync } from 'jse-eval';
const fn = compileAsync('foo.bar + 10');
fn({foo: {bar: 'baz'}}); // 'baz10'
```

### One-Line Parse + Evaluation
```javascript
import { evalExpr } from 'jse-eval';
evalExpr('foo.bar + 10', {foo: {bar: 'baz'}}); // baz10

// alternatively:
import { evalExprAsync } from 'jse-eval';
evalExprAsync('foo.bar + 10', {foo: {bar: 'baz'}}); // baz10
```

### JSEP Plugins
```javascript
import { registerPlugin } from 'jse-eval';
registerPlugin(
  require('@jsep-plugin/arrow'),
  require('@jsep-plugin/assignment'),
  require('@jsep-plugin/async-await'),
  require('@jsep-plugin/new'),
  require('@jsep-plugin/object'),
  require('@jsep-plugin/regex'),
  require('@jsep-plugin/spread'),
  require('@jsep-plugin/template'),
  require('@jsep-plugin/ternary')
);

// or alternatively:
const { jsep } = require('jse-eval');
jsep.plugins.register(
  require('@jsep-plugin/arrow'),
  require('@jsep-plugin/assignment'),
  ...
);
```

## Extending evaluation

To modify the evaluation, use any of the modification methods:
- `addUnaryOp(operator, evaluator)`. Will add the operator to jsep, and the function to evaluate the operator
- `addBinaryOp(operator, precedence | evaluator, evaluator)`. Will add the operator to jsep at the given
precedence (if provided), and the function to evaluate the operator
- `addEvaluator(nodeType, evaluator)`. Will add the evaluator function to the map of functions
for each node type. This evaluator will be called with the ExpressionEval instance bound to it.
The evaluator is responsible for handling both sync and async, as needed, but can use the `this.isAsync`
or `this.evalSyncAsync()` to help.
  - If the node type is unknown, jse-eval will check for a `default` node type handler before
  throwing an error for an unknown node type. If any other behavior is desired, this can be overridden
  by providing a new `default` evaluator.

Extensions may also be added as plugins using the `registerPlugin(myPlugin1, myPlugin2...)` method.
The plugins are extensions of the JSEP format. If the `init` method is defined in the plugin,
then the plugin will be added to JSEP, and/or if the `initEval` method is defined in the plugin,
then the `initEval` method will be called with the JseEval class as both `this` and as an argument
so the plugin code may extend as necessary.

### Example Extensions:
```javascript
import * as expr from 'jse-eval';

expr.addBinaryOp('**', 11, true, (a, b) => a ** b);
console.log(expr.evalExpr('2 ** 3 ** 2')); // 512

expr.addBinaryOp('^', 11, (a, b) => Math.pow(a, b)); // Replace XOR with Exponent
console.log(expr.evalExpr('3^2')); // 9

expr.addEvaluator('TestNodeType', function(node) {
  return node.test + this.context.string
});
console.log(expr.eval({ type: 'TestNodeType', test: 'testing ' }, { string: 'jse-eval' })); // 'testing jse-eval'

const myPlugin = {
  name: 'Exponentiation',
  init(jsep) {
    jsep.addBinaryOp('**', 11, true);
  },
  initEval(JseEval) {
    JseEval.binops['**'] = (a, b) => a ** b;
  },
};
expr.registerPlugin(myPlugin);
console.log(expr.evalExpr('2 ** 3 ** 2')); // 512
```

### Node Types Supported:
This project will try to stay current with all JSEP's node types::
- `ArrayExpression`
- `LogicalExpression`/`BinaryExpression`
- `CallExpression`
- `ConditionalExpression`
- `Compound` *Compound support will evaluate each expression and return the result of the final one*
- `Identifier`
- `Literal`
- `MemberExpression`
- `ThisExpression`
- `UnaryExpression`

As well as the optional plugin node types:
- `ArrowFunctionExpression`
- `AssignmentExpression`/`UpdateExpression`
- `AwaitExpression`
- `NewExpression`
- `ObjectExpression`
- `SpreadElement`
- `TaggedTemplateExpression`/`TemplateLiteral`

## Related Packages
Depending on your specific use-case, there are other
related packages available, including:
- [jsep](https://github.com/EricSmekens/jsep)
- [expression-eval](https://github.com/donmccurdy/expression-eval)
- [eval-estree-expression](https://github.com/jonschlinkert/eval-estree-expression)
- [es-tree-walker](https://github.com/Rich-Harris/estree-walker)
- [acorn](https://github.com/acornjs/acorn)
- [astree](https://github.com/davidbonnet/astring)

## Security

Although this package does [avoid the use of `eval()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#Do_not_ever_use_eval!), it _cannot guarantee that user-provided expressions, or user-provided inputs to evaluation, will not modify the state or behavior of your application_. This library does not attempt to provide a secure sandbox for evaluation. Evaluation of arbitrary user inputs (expressions or values) may lead to unsafe behavior. If your project requires a secure sandbox, consider alternatives such as [vm2](https://www.npmjs.com/package/vm2).

## Contributing

Want to file a bug, contribute some code, or improve documentation?
Excellent! Read up on the guidelines for [contributing](CONTRIBUTING.md)
and then feel free to submit a PR with your contribution.

### Code of Conduct

Help us keep this project open and inclusive. Please read and follow
the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

MIT License.
