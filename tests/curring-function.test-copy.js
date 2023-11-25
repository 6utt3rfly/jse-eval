import tape from 'tape';
import JseEval from '../dist/jse-eval.module.js';
import {cloneDeep} from './utils.js';

const _action = function(arg1, arg2, arg3) {return arg1 + ' ' + arg2 + ' ' + arg3};
const action = (arg1) => (arg2, arg3) => _action(arg1, arg2, arg3);

const _value = _action('q', 'w', 'e');

const act = action('q');
const value = act('w', 'e');

// console.log('_value', _value);
// console.log('value', value);



// const getCat = (args) => {
//   const catObject = {
//     type: 'Cat',
//     name: 'Miss Kitty',
//     num: 3,
//     says: function() {return this.type + ' ' + this.name + ' says meow';},
//     __action: function(args, n, t) {return this.name + ' ' + args.join(' ') + ' ' + n + ' ' + t;},
//     action: () => catObject.__action(args),
//   }
//   return catObject;
// }

// function getDog(args) {
//   const dogObject = {
//     type: 'Dog',
//     name: 'Ralph',
//     num: 5,
//     says: function() {return this.type + ' ' + this.name + ' says woof';},
//     action: () => this.__action(args),
//     __action: function(args, n, t) {return this.name + ' ' + args.join(' ') + ' ' + n + ' ' + t;},
//   }
//   return dogObject;
// }

// const getCounter = () => {
//   const counterObject = {
//      value: 0,
//      increment: function() {return ++this.value;}
//   }
//   return counterObject;
// }  

// const getContext = (args) => {
//   const context = {
//     cat: getCat(args),
//     dog: getDog(args),
//     counter: getCounter()
//   }
//   return context;
// }

// const args = ['says', 'woof'];

// const context = getContext(args);

// // console.log(context);


// const scopeFixtures = [
//   // {expr: 'Cat.Says()', context: context, expected: 'Cat Miss Kitty says meow'},
//   // {expr: 'Dog.Says()', context: context, expected: 'Dog Ralph says woof'},
//   // {expr: 'dog.type + " name is " + dog.name', context: context, expected: 'Dog name is Ralph'},
//   // {expr: 'counter.increment()+counter.increment();counter.value', context: context, expected: 2},
//   {expr: 'cat.action(cat.num, "times")', context: context, expected: 'Miss Kitty says meow 3 times'},
//   // {expr: 'dog.action(dog.num, "times")', context: context, expected: 'Ralph says woof 5 times'},
// ];

// const scopeOptions = {
//   caseSensitive: false,
// }

// tape('curringFunction', (t) => {

//   [...scopeFixtures].forEach((o) => {
//     const ctx = cloneDeep(o.context || context);
//     const options = cloneDeep(scopeOptions);
//     const ast = JseEval.jsep(o.expr);
//     const val = JseEval.evaluate(ast, ctx, options);

//     const compare = t[typeof o.expected === 'object' ? 'deepEqual' : 'equal'];
//     compare(val, o.expected, `${o.expr} (${val}) === ${o.expected}`);
//   });

//   t.end();
// });

tape('curringFunction', (t) => {

   t.end();
});

