import tape from 'tape';
import JseEval from '../dist/jse-eval.module.js';
import {cloneDeep} from './utils.js';

const getCat = (args) => {
  const catObject = {
    type: 'Cat',
    name: 'Miss Kitty',
    num: 3,
    says: function() {return this.type + ' ' + this.name + ' says meow';},
    __action: function(args, n, t) {return this.name + ' ' + args.join(' ') + ' ' + n + ' ' + t;},
    action: (n, t) => catObject.__action(args, n, t),
  }
  return catObject;
}

function getDog(args) {
  const dogObject = {
    type: 'Dog',
    name: 'Ralph',
    num: 5,
    says: function() {return this.type + ' ' + this.name + ' says woof';},
    action: () => this.__action(args),
    __action: function(args, n, t) {return this.name + ' ' + args.join(' ') + ' ' + n + ' ' + t;},
  }
  return dogObject;
}

const getCounter = () => {
  const counterObject = {
     value: 0,
     increment: function() {return ++this.value;}
  }
  return counterObject;
}  

const getContext = (args) => {
  const context = {
    cat: getCat(args),
    dog: getDog(args),
    counter: getCounter()
  }
  return context;
}

const args = ['says', 'meow'];

const context = getContext(args);

// console.log(context);


const scopeFixtures = [
  // {expr: 'Cat.Says()', context: context, expected: 'Cat Miss Kitty says meow'},
  // {expr: 'Dog.Says()', context: context, expected: 'Dog Ralph says woof'},
  // {expr: 'dog.type + " name is " + dog.name', context: context, expected: 'Dog name is Ralph'},
  // {expr: 'counter.increment()+counter.increment();counter.value', context: context, expected: 2},
  {expr: 'cat.action(cat.num, "times")', context: context, expected: 'Miss Kitty says meow 3 times'},
  // {expr: 'dog.action(dog.num, "times")', context: context, expected: 'Ralph says woof 5 times'},
];

const scopeOptions = {
  caseSensitive: false,
}

tape('curringFunction', (t) => {

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
