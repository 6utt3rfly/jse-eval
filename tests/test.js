import 'source-map-support/register.js';
import JseEval from '../dist/jse-eval.module.js';
import { registerPlugin } from '../dist/jse-eval.module.js';
import jsepArrow from '@jsep-plugin/arrow';
import jsepAssignment from '@jsep-plugin/assignment';
import jsepAsyncAwait from '@jsep-plugin/async-await';
import jsepNew from '@jsep-plugin/new';
import jsepObject from '@jsep-plugin/object';
import jsepRegex from '@jsep-plugin/regex';
import jsepSpread from '@jsep-plugin/spread';
import jsepTemplate from '@jsep-plugin/template';
import jsepTernary from '@jsep-plugin/ternary';

registerPlugin(
  jsepArrow,
  jsepAssignment,
  jsepAsyncAwait,
  jsepNew,
  jsepObject,
  jsepRegex,
  jsepSpread,
  jsepTemplate,
  jsepTernary
);

JseEval.addUnaryOp('@', (a) => {
  if (a === 2) {
    return 'two';
  }
  throw new Error('Unexpected value: ' + a);
});

JseEval.addBinaryOp('#', (a, b) => a + b / 10);

JseEval.addBinaryOp('~', 1, (a, b) => a * b);

JseEval.addBinaryOp('**', 11, true, (a, b) => a ** b);

JseEval.addEvaluator('TestNodeType', function(node) { return node.test + this.context.string });
JseEval.addEvaluator('TestNodeType2', function(node, context) { return node.test + context.string });

export * from './sync.test.js';
export * from './async.test.js';
export * from './errors.test.js';
export * from './case-insensitive.test.js';
export * from './block-list.test.js';
export * from './allow-list.test.js';
export * from './explicit-this.test.js';
export * from './function-bindings.test.js';
export * from './scope-function-bindings.test.js';
export * from './current-scope.test.js';
export * from './current-scope-variable.test.js';
export * from './curring-function.test.js';
export * from './curring-function.test-copy.js';
