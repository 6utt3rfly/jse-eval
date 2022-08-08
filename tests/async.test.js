import tape from 'tape';
import JseEval from '../dist/jse-eval.module.js';
import {cloneDeep} from './utils.js';
import {asyncContext} from './context.js';
import {fixtures, asyncFixtures} from './fixtures.js';

tape('async', async (t) => {

  for (let o of [...fixtures, ...asyncFixtures]) {
    const ctx = cloneDeep(o.context || asyncContext);
    const val = await JseEval.compileAsync(o.expr)(ctx);
    const compare = t[typeof o.expected === 'object' ? 'deepEqual' : 'equal'];
    compare(val, o.expected, `${o.expr} (${val}) === ${o.expected}`);
    if (o.expObj) {
      t.deepEqual(ctx, o.expObj, `${o.expr} (${JSON.stringify(ctx)}) === ${JSON.stringify(o.expObj)}`);
    }
  }

  const val = await JseEval.evalAsync.bind(null, { type: 'TestNodeType', test: 'testing ' })(asyncContext);
  t.equal(val, 'testing string');
  t.equal(JseEval.evaluate.bind(null, { type: 'TestNodeType2', test: 'testing ' })(asyncContext), 'testing string');

  t.end();
});
