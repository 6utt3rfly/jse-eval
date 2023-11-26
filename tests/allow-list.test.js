import tape from 'tape';
import JseEval from '../dist/jse-eval.module.js';
import {cloneDeep} from './utils.js';

const allowListFixtures = [
  {expr: 'badName', errorExpected: true},
  {expr: 'eval("2 + 2")', errorExpected: true},
  {expr: 'goodName', errorExpected: false},
  {expr: 'func(1+2)', errorExpected: false},
];

const allowListOptions = {
  caseSensitive: false,
  allowList: ['goodName', 'func']
}

const allowListContext = {
  badName: 1, 
  goodName: 2,
  func: function(...x) { return x.reduce((sum, v) => sum + v, 1); },
}

const expectedMsg = /Access to member "\w+" not in allowList is not permitted./;

tape('allowList', (t) => {

  [...allowListFixtures].forEach((o) => {
    const ctx = cloneDeep(allowListContext);
    const ast = JseEval.jsep(o.expr);
    if (o.errorExpected) {
      t.throws(() => JseEval.evaluate(ast, ctx, allowListOptions), expectedMsg, `error thrown for ${o.expr}`);
    } else {
      t.doesNotThrow(() => JseEval.evaluate(ast, ctx, allowListOptions), expectedMsg, o.expr);
    }
  });

  t.end();
});
