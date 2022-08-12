import tape from 'tape';
import JseEval from '../dist/jse-eval.module.js';
import {cloneDeep} from './utils.js';

const context = {
  counter: 0,
  increment: function() {return ++this.counter;},
}

const explicitThisFixtures = [
  {expr: 'this.increment()', context: null, expected: 1}
];


tape('explicitThis', (t) => {

  [...explicitThisFixtures].forEach((o) => {
    const ctx = cloneDeep(o.context || context);
    const ast = JseEval.jsep(o.expr);
    const val = JseEval.evaluate(ast, ctx, {});

    const compare = t[typeof o.expected === 'object' ? 'deepEqual' : 'equal'];
    compare(val, o.expected, `${o.expr} (${val}) === ${o.expected}`);
  });

  t.end();
});
