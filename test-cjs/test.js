const tape = require('tape');
const JseEval = require('../dist/jse-eval.cjs');
const { evalExpr } = require('../dist/jse-eval.cjs');

tape('destructured', (t) => {
  t.equal(evalExpr('a + b', { a: 1, b: 3 }), 4);
  t.end();
});

tape('full export', (t) => {
  t.equal(JseEval.evalExpr('a + b', { a: 1, b: 3 }), 4);
  t.end();
});
