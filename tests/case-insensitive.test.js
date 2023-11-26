import 'source-map-support/register.js';
import JseEval from '../dist/jse-eval.module.js';
import { registerPlugin } from '../dist/jse-eval.module.js';
import tape from 'tape';
import jsepArrow from '@jsep-plugin/arrow';
import jsepAssignment from '@jsep-plugin/assignment';
import jsepAsyncAwait from '@jsep-plugin/async-await';
import jsepNew from '@jsep-plugin/new';
import jsepObject from '@jsep-plugin/object';
import jsepRegex from '@jsep-plugin/regex';
import jsepSpread from '@jsep-plugin/spread';
import jsepTemplate from '@jsep-plugin/template';
import jsepTernary from '@jsep-plugin/ternary';

import {cloneDeep} from './utils.js';
import {context} from './context.js';

const caseInsensitiveOptions = {
  caseSensitive: false
}

const caseInsensitiveFixtures = [

  {expr: 'True', expected: true},

  // array expression
  {expr: 'IsArray([1,2,3])',           expected: true    },
  {expr: 'LiSt[3]',                    expected: 4       },
  {expr: 'NumMap[1 + two]',            expected: 'three' },

  {expr: 'THREE', expected: 3},
  {expr: 'ONE + THREE', expected: 4},

  // call expression
  {expr: 'FUNC(5)',   expected: 6},
  {expr: 'Func(1+2)', expected: 4},

  // conditional expression
  {expr: '(True ? "true" : "false")',               expected: 'true'  },
  {expr: '( ( Bool || False ) ? "true" : "false")', expected: 'true'  },
  {expr: '( True ? ( 123*456 ) : "false")',         expected: 123*456 },
  {expr: '( False ? "true" : one + two )',          expected: 3       },

  // identifier
  {expr: 'String', expected: 'string' },
  {expr: 'Number', expected: 123      },
  {expr: 'BOOL',   expected: true     },

  // literal
  {expr: '"foo"', expected: 'foo' }, // string literal
  {expr: "'foo'", expected: 'foo' }, // string literal
  {expr: 'True',  expected: true  }, // boolean literal

  // logical expression
  {expr: 'True || False',   expected: true  },
  {expr: 'True && False',   expected: false },

  // logical expression lazy evaluation
  {expr: 'True || Throw()',  expected: true   },
  {expr: 'False || True',    expected: true   },
  {expr: 'False && Throw()', expected: false  },
  {expr: 'True && False',    expected: false  },

  // member expression
  {expr: 'foO.baR',      expected: 'baz'     },
  {expr: 'foO["baR"]',   expected: 'baz'     },
  {expr: 'foO[Foo.Bar]', expected: 'wow'     },
  {expr: 'Foo?.Bar',     expected: 'baz'     },
  {expr: 'FoO?.["BaR"]', expected: 'baz'     },
  {expr: 'UnKnown?.x',   expected: undefined },

  // call expression with member - it does not pass the test for "BAR", because this[x] is case-sensitive
  // ToDo: add predefied functions
  {expr: 'Foo.Func("bar")',  expected: 'baz'     },
  {expr: 'Foo?.Func("bar")', expected: 'baz'     },
  {expr: 'Xxx?.Func("bar")', expected: undefined },

  // unary expression
  {expr: '-One',   expected: -1   },
  {expr: '+Two',   expected: 2    },
  {expr: '!False', expected: true },
  {expr: '!!True', expected: true },

  // 'this' context
  {expr: 'This.Three', expected: 3 },

  // Arrow Functions
  {expr: '[1,2].Find(v => v === 2)',                     expected: 2                                  },
  {expr: 'list.Reduce((sum, v) => sum + v, 0)',          expected: 15                                 },
  {expr: 'list.FIND(() => False)',                       expected: undefined                          },
  {expr: 'list.FindIndex(v => v === 3)',                 expected: 2                                  },
  {expr: '[1].MAP(() => ({ a: 1 }))',                    expected: [{ a: 1 }]                         },
  {expr: '[[1, 2]].Map([a, b] => a + b)',                expected: [3]                                },
  {expr: '[[1, 2]].map(([a, b] = []) => a+b)',           expected: [3]                                },
  {expr: '[[1,],Undefined].Map(([a=2, b=5]=[]) => a+b)', expected: [6, 7]                             },
  {expr: '[{a:1}].Map(({a}) => a)',                      expected: [1]                                },
  {expr: '[Undefined].Map(({a=1}={}) => a)',             expected: [1]                                },
  {expr: '[1, 2].mAp((a, ...b) => [a, b])',              expected: [ [1, [0,[1,2]]], [2, [1,[1,2]]] ] },
  {expr: '[{a:1,b:2,c:3}].MaP(({a, ...b}) => [a, b])',   expected: [[1, {b:2,c:3}]]                   },
  {expr: '[{a:1}].Map(({...foo}) => foo.a)',             expected: [1]                                },

  // assignment/update
  {expr: 'A = 2', expected: 2, context: {a: 1}, expObj: {a: 2}},
  {expr: 'A += 2', expected: 3, context: {a: 1}, expObj: {a: 3}},
  {expr: 'A++', expected: 1, context: {a: 1}, expObj: {a: 2}},
  {expr: '++A', expected: 2, context: {a: 1}, expObj: {a: 2}},
  {expr: 'A--', expected: 1, context: {a: 1}, expObj: {a: 0}},
  {expr: '--A', expected: 0, context: {a: 1}, expObj: {a: 0}},
  {expr: 'A[0] = 3', expected: 3, context: {a: [0, 0]}, expObj: {a: [3, 0]}},

  // compound
  {expr: 'a=1; b=a; c=a+b;', expected: 2, context: {}, expObj: {a: 1, b: 1, c: 2}},

  // new
  {expr: '(new date(2021, 8)).GetFullYear()',             expected: 2021                          },
  {expr: '(new sUb.sUb2["Date"](2021, 8)).GetFullYear()', expected: 2021                          },
  {expr: 'new dAtE(2021, 8)',                             expected: new Date(2021, 8) },

  // object, spread
  {expr: '{ a: "a", one, [Foo.Bar]: 2 }', expected: { a: 'a', one: 1, baz: 2 }        },
  {expr: '{ a: "a", ...numMAP }',         expected: { a: 'a', 10: 'ten', 3: 'three' } }, //
  {expr: '[7, ...lisT]',                  expected: [7,1,2,3,4,5]                     },
  {expr: 'Func(1, ...lisT)',              expected: 17                                },

  // template literals
  {expr: '`abc`',                             expected: 'abc'               },
  {expr: '`hi ${Foo.BAR}`',                   expected: 'hi baz'            },
  {expr: 'tag`hi ${LiSt[0]} and ${LIst[3]}`', expected: 'hi , and ,,=>,1,4' },
];


tape('eval - caseInsensitive', (t) => {
  [...caseInsensitiveFixtures].forEach((o) => {
    const ctx = cloneDeep(o.context || context);
    const ast = JseEval.jsep(o.expr);
    const val = JseEval.evaluate(ast, ctx, caseInsensitiveOptions);
    const compare = t[typeof o.expected === 'object' ? 'deepEqual' : 'equal'];
    compare(val, o.expected, `${o.expr} (${val}) === ${o.expected}`);
    if (o.expObj) {
      t.deepEqual(ctx, o.expObj, `${o.expr} (${JSON.stringify(ctx)}) === ${JSON.stringify(o.expObj)}`);
    } else {
      compare(ast._value, o.expected, `${o.expr} (node._value ${val}) === ${o.expected}`);
    }
  });

  t.end();
});

tape('compile - caseInsensitive', (t) => {
  [...caseInsensitiveFixtures].forEach((o) => {
    const ctx = cloneDeep(o.context || context);
    JseEval.addOptions(caseInsensitiveOptions);
    const fn = JseEval.compile(o.expr);
    const val = fn(ctx);
    const compare = t[typeof o.expected === 'object' ? 'deepEqual' : 'equal'];
    compare(val, o.expected, `${o.expr} (${val}) === ${o.expected}`);
    if (o.expObj) {
      t.deepEqual(ctx, o.expObj, `${o.expr} (${JSON.stringify(ctx)}) === ${JSON.stringify(o.expObj)}`);
    } else {
      compare(val, o.expected, `${o.expr} (${val}) === ${o.expected}`);
    }
  });

  t.end();
});
