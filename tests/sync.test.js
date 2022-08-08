import tape from 'tape';
import JseEval from '../dist/jse-eval.module.js';
import {cloneDeep} from './utils.js';
import {context} from './context.js';
import {fixtures, syncFixtures} from './fixtures.js';

tape('sync', (t) => {

  [...fixtures, ...syncFixtures].forEach((o) => {
    const ctx = cloneDeep(o.context || context);
    const ast = JseEval.jsep(o.expr);
    const val = JseEval.evaluate(ast, ctx);
    const compare = t[typeof o.expected === 'object' ? 'deepEqual' : 'equal'];
    compare(val, o.expected, `${o.expr} (${val}) === ${o.expected}`);
    if (o.expObj) {
      t.deepEqual(ctx, o.expObj, `${o.expr} (${JSON.stringify(ctx)}) === ${JSON.stringify(o.expObj)}`);
    } else {
      compare(ast._value, o.expected, `${o.expr} (node._value ${val}) === ${o.expected}`);
    }
  });

  const val = JseEval.evaluate.bind(null, { type: 'TestNodeType', test: 'testing ' })(context);
  t.equal(val, 'testing string');
  t.equal(JseEval.evaluate.bind(null, { type: 'TestNodeType2', test: 'testing ' })(context), 'testing string');

  t.end();
});
