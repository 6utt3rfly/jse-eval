import tape from 'tape';
import JseEval from '../dist/jse-eval.module.js';
import {cloneDeep} from './utils.js';

const context = {
  calc: { x: 1 }
}

const scopeOptions = {
  caseSensitive: false,
  scopes: { calc: {} },
  currentScopeName: 'calc'
}

const scopeFixtures = [
  {expr: 'calc.x + 1', context: null, expected: 2},
  {expr: 'x + 1', context: null, expected: 2},
];

tape('currentScope-varible', (t) => {

  [...scopeFixtures].forEach((o) => {
    const ctx = cloneDeep(o.context || context);
    const options = cloneDeep(scopeOptions);
    const ast = JseEval.jsep(o.expr);
    const val = JseEval.evaluate(ast, ctx, options);

    const compare = t[typeof o.expected === 'object' ? 'deepEqual' : 'equal'];
    compare(val, o.expected, `${o.expr} (${val}) === ${o.expected}`);
  });

  t.end();
});
