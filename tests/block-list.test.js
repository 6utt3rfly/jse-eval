import tape from 'tape';
import JseEval from '../dist/jse-eval.module.js';
import {cloneDeep} from './utils.js';

const blockListFixtures = [
  {expr: 'badName', errorExpected: true},
  {expr: 'eval("2 + 2")', errorExpected: true},
  {expr: 'goodName', errorExpected: false},
  {expr: 'func(1+2)', errorExpected: false},
];

const blockListOptions = {
  caseSensitive: false,
  blockList: ['BadName', 'Eval']
}

const blockListContext = {
  badName: 1, 
  goodName: 2,
  func: function(...x) { return x.reduce((sum, v) => sum + v, 1); },
}

tape('blockList', (t) => {

  const expectedMsg = /Access to member "\w+" from blockList is not permitted./;

  [...blockListFixtures].forEach((o) => {
    const ctx = cloneDeep(blockListContext);
    const ast = JseEval.jsep(o.expr);
    if (o.errorExpected) {
      t.throws(() => JseEval.evaluate(ast, ctx, blockListOptions), expectedMsg, `error thrown for ${o.expr}`);
    } else {
      t.doesNotThrow(() => JseEval.evaluate(ast, ctx, blockListOptions), expectedMsg, o.expr);
    }
  });

  t.end();
});
