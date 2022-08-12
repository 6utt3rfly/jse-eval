import tape from 'tape';
import JseEval from '../dist/jse-eval.module.js';
import {cloneDeep} from './utils.js';

const cat = {
  num: 3,
  name: 'Miss Kitty',
  action: function(args, n, t) {return this.name + ' ' + args.join(' ') + ' ' + n + ' ' + t;},
  says: function() {return this.name + ' says meow';},
}

const catFunctionBindings = {
  action: {
    thisRef: cat,
    arguments: ['says', 'meow']
  },
  says: {
    thisRef: cat
  },
}

const functionBindingsFixtures = [
  {expr: 'action(num, "times")', context: null, expected: 'Miss Kitty says meow 3 times'},
  {expr: 'says()', context: null, expected: 'Miss Kitty says meow'},
];

const functionBindingsOptions = {
  caseSensitive: false,
  functionBindings: {...catFunctionBindings}
}

tape('functionBindings', (t) => {

  [...functionBindingsFixtures].forEach((o) => {
    const ctx = cloneDeep(o.context || cat);
    const ast = JseEval.jsep(o.expr);
    const val = JseEval.evaluate(ast, ctx, functionBindingsOptions);

    const compare = t[typeof o.expected === 'object' ? 'deepEqual' : 'equal'];
    compare(val, o.expected, `${o.expr} (${val}) === ${o.expected}`);
  });

  t.end();
});
