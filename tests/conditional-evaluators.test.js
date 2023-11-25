import tape from 'tape';
import JseEval from '../dist/jse-eval.module.js';
import {cloneDeep} from './utils.js';

var lookupContext = {
  two: 2, 
  three: 3,
  add: function(a, b) {return a + b;},
};  

// override default implementation:
JseEval.addEvaluator('Identifier', function myIdentifier(node, ctx) {
  return ctx?.[node.name];
});

// add conditional evaluator:
JseEval.addConditionalEvaluator('Identifier', 
  function predicate(node, ctx) {
    var found = node.type === 'Identifier' && lookupContext[node.name] !== undefined;
    // console.log('predicate', found);
    return found;
  },
  function identifier(node, ctx) {
    // cconsole.log('identifier', node, lookupContext);
    return lookupContext?.[node.name];
  }
);

JseEval.addConditionalEvaluator('CallExpression', 
  function predicate(node, ctx) {
    var found = node.type === 'CallExpression' && lookupContext[node.callee] !== undefined;
    // console.log('predicate', found);
    return found;
  },
  function callExpression(node, ctx) {
    console.log('callExpression', node, lookupContext);
    return lookupContext?.[node.name];
  }
);


const conditionalEvaluatorFixtures = [
  {expr: 'one', context: { one: 1 }, expected: 1},
  {expr: 'one+two', context: {one: 1 }, expected: 3},
  {expr: 'add(one,two)', context: {one: 1 }, expected: 3},
];

tape('conditionalEvaluator', (t) => {

  [...conditionalEvaluatorFixtures].forEach((o) => {
    const ctx = cloneDeep(o.context);
    const ast = JseEval.jsep(o.expr);
    const val = JseEval.evaluate(ast, ctx, conditionalEvaluatorFixtures);

    const compare = t[typeof o.expected === 'object' ? 'deepEqual' : 'equal'];
    compare(val, o.expected, `${o.expr} (${val}) === ${o.expected}`);
  });

  t.end();
});

