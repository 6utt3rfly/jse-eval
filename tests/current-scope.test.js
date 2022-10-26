import tape from 'tape';
import JseEval from '../dist/jse-eval.module.js';
import {cloneDeep} from './utils.js';

const catObject = {
  type: 'Cat',
  name: 'Miss Kitty',
  num: 3,
  says: function() {return this.type + ' ' + this.name + ' says meow';},
  action: function(args, n, t) {return this.name + ' ' + args.join(' ') + ' ' + n + ' ' + t;},
}

const catFunctionBindings = {
  says: {
    thisRef: catObject
  },
  action: {
    thisRef: catObject,
    arguments: [['says', 'meow']]
  },
}

const dogObject = {
  type: 'Dog',
  name: 'Ralph',
  num: 5,
  says: function() {return this.type + ' ' + this.name + ' says woof';},
  action: function(args, n, t) {return this.name + ' ' + args.join(' ') + ' ' + n + ' ' + t;},
}

const dogFunctionBindings = {
  says: {
    thisRef: dogObject
  },
  action: {
    thisRef: dogObject,
    arguments: [['says', 'woof']]
  },
}

const counterObject = {
  value: 0,
  increment: function() {return ++this.value;}
}

const counterFunctionBindings = {
  says: {
    thisRef: counterObject
  },
}

const context = {
  cat: catObject,
  dog: dogObject,
  counter: counterObject
}

const scopeFixtures = [
  {expr: 'cat.says()', context: null, expected: 'Cat Miss Kitty says meow'},
  {expr: 'dog.says()', context: null, expected: 'Dog Ralph says woof'},
  {expr: 'dog.type + " name is " + dog.name', context: null, expected: 'Dog name is Ralph'},
  {expr: 'counter.increment()+counter.increment();counter.value', context: null, expected: 2},
  {expr: 'cat.action(cat.num, "times")', context: null, expected: 'Miss Kitty says meow 3 times'},
  {expr: 'dog.action(dog.num, "times")', context: null, expected: 'Ralph says woof 5 times'},
  {expr: 'says()', context: null, expected: 'Cat Miss Kitty says meow'},
  {expr: 'action(num, "times")', context: null, expected: 'Miss Kitty says meow 3 times'},
];

const scopeOptions = {
  caseSensitive: false,
  scopes: {
    cat: {
      options: {functionBindings: {...catFunctionBindings}}
    },
    dog: {
      options: {functionBindings: {...dogFunctionBindings}}
    }
  },
  currentScopeName: 'cat'
}


tape('currentScope', (t) => {

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
