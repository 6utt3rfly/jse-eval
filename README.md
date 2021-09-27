# jse-eval

[![Latest NPM release](https://img.shields.io/npm/v/jse-eval.svg)](https://www.npmjs.com/package/jse-eval)
[![Minzipped size](https://badgen.net/bundlephobia/minzip/jse-eval)](https://bundlephobia.com/result?p=jse-eval)
[![License](https://img.shields.io/badge/license-MIT-007ec6.svg)](https://github.com/donmccurdy/jse-eval/blob/master/LICENSE)
[![CI](https://github.com/donmccurdy/jse-eval/workflows/CI/badge.svg?branch=master&event=push)](https://github.com/donmccurdy/jse-eval/actions?query=workflow%3ACI)

## Credits
Heavily based on [expression-eval](https://github.com/donmccurdy/expression-eval] and [jsep](https://github.com/EricSmekens/jsep),
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
(as well as [@babel/parser][], [esprima][], [acorn][], or any other library that parses and returns a valid `estree` expression).


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

### JSEP Plugins
```javascript
const { jsep } = require('jse-eval');
jsep.plugins.register(
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

### Node Types Supported:
This project will try to stay current with all JSEP's node types::
- `ArrayExpression`
- `LogicalExpression`/`BinaryExpression`
- `CallExpression`
- `ConditionalExpression`
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
Excellent! Read up on our guidelines for [contributing][contributing] and then check out one of our issues labeled as <kbd>[help wanted](https://github.com/angular/angular/labels/help%20wanted)</kbd> or <kbd>[good first issue](https://github.com/angular/angular/labels/good%20first%20issue)</kbd>.

### Code of Conduct

Help us keep this project open and inclusive. Please read and follow
the [Code of Conduct][codeofconduct].

## License

MIT License.
