export const fixtures = [

  // array expression
  {expr: '([1,2,3])[0]',               expected: 1       },
  {expr: '(["one","two","three"])[1]', expected: 'two'   },
  {expr: '([true,false,true])[2]',     expected: true    },
  {expr: '([1,true,"three"]).length',  expected: 3       },
  {expr: 'isArray([1,2,3])',           expected: true    },
  {expr: 'list[3]',                    expected: 4       },
  {expr: 'numMap[1 + two]',            expected: 'three' },

  // binary expression
  {expr: '1+2',         expected: 3},
  {expr: '2-1',         expected: 1},
  {expr: '2*2',         expected: 4},
  {expr: '6/3',         expected: 2},
  {expr: '5|3',         expected: 7},
  {expr: '5&3',         expected: 1},
  {expr: '5^3',         expected: 6},
  {expr: '4<<2',        expected: 16},
  {expr: '256>>4',      expected: 16},
  {expr: '-14>>>2',     expected: 1073741820},
  {expr: '10%6',        expected: 4},
  {expr: '"a"+"b"',     expected: 'ab'},
  {expr: 'one + three', expected: 4},

  // call expression
  {expr: 'func(5)',   expected: 6},
  {expr: 'func(1+2)', expected: 4},

  // conditional expression
  {expr: '(true ? "true" : "false")',               expected: 'true'  },
  {expr: '( ( bool || false ) ? "true" : "false")', expected: 'true'  },
  {expr: '( true ? ( 123*456 ) : "false")',         expected: 123*456 },
  {expr: '( false ? "true" : one + two )',          expected: 3       },

  // identifier
  {expr: 'string', expected: 'string' },
  {expr: 'number', expected: 123      },
  {expr: 'bool',   expected: true     },

  // literal
  {expr: '"foo"', expected: 'foo' }, // string literal
  {expr: "'foo'", expected: 'foo' }, // string literal
  {expr: '123',   expected: 123   }, // numeric literal
  {expr: 'true',  expected: true  }, // boolean literal

  // logical expression
  {expr: 'true || false',   expected: true  },
  {expr: 'true && false',   expected: false },
  {expr: '1 == "1"',        expected: true  },
  {expr: '2 != "2"',        expected: false },
  {expr: '1.234 === 1.234', expected: true  },
  {expr: '123 !== "123"',   expected: true  },
  {expr: '1 < 2',           expected: true  },
  {expr: '1 > 2',           expected: false },
  {expr: '2 <= 2',          expected: true  },
  {expr: '1 >= 2',          expected: false },

  // logical expression lazy evaluation
  {expr: 'true || throw()',  expected: true   },
  {expr: 'false || true',    expected: true   },
  {expr: 'false && throw()', expected: false  },
  {expr: 'true && false',    expected: false  },

  // member expression
  {expr: 'foo.bar',      expected: 'baz'     },
  {expr: 'foo["bar"]',   expected: 'baz'     },
  {expr: 'foo[foo.bar]', expected: 'wow'     },
  {expr: 'foo?.bar',     expected: 'baz'     },
  {expr: 'foo?.["bar"]', expected: 'baz'     },
  {expr: 'unknown?.x',   expected: undefined },

  // call expression with member (and this)
  {expr: 'foo.func("bar")',  expected: 'baz'     },
  {expr: 'foo?.func("bar")', expected: 'baz'     },
  {expr: 'xxx?.func("bar")', expected: undefined },
  {expr: 'string.slice(2)',  expected: 'ring'    },

  // unary expression
  {expr: '-one',   expected: -1   },
  {expr: '+two',   expected: 2    },
  {expr: '!false', expected: true },
  {expr: '!!true', expected: true },
  {expr: '~15',    expected: -16  },
  {expr: '+[]',    expected: 0    },

  // 'this' context
  {expr: 'this.three', expected: 3 },
  {expr: 'this.three',                             expected: 3         },
  {expr: 'thisTestFn()',                           expected: 2         },
  {expr: '"foo".slice(1)',                         expected: 'oo'      },
  {expr: 'thisTestArrow()',                        expected: undefined }, // global this
  {expr: 'thisTestArrow.bind({ number: 1 })()',    expected: undefined }, // still global this
  {expr: 'foo.func.bind({ bar: "fight" })("bar")', expected: 'fight'   }, // bind overrides function()
  
  // custom operators
  {expr: '@2',          expected: 'two' },
  {expr: '3#4',         expected: 3.4   },
  {expr: '(1 # 2 # 3)', expected: 1.5   }, // Fails with undefined precedence, see issue #45
  {expr: '1 + 2 ~ 3',   expected: 9     }, // ~ is * but with low precedence
  {expr: '2 ** 3 ** 4', expected: 2 ** 3 ** 4},

  // Arrow Functions
  {expr: '[1,2].find(v => v === 2)',                     expected: 2                                  },
  {expr: 'list.reduce((sum, v) => sum + v, 0)',          expected: 15                                 },
  {expr: 'list.find(() => false)',                       expected: undefined                          },
  {expr: 'list.findIndex(v => v === 3)',                 expected: 2                                  },
  {expr: '[1].map(() => ({ a: 1 }))',                    expected: [{ a: 1 }]                         },
  {expr: '[[1, 2]].map([a, b] => a + b)',                expected: [3]                                },
  {expr: '[[1, 2]].map(([a, b] = []) => a+b)',           expected: [3]                                },
  {expr: '[[1,],undefined].map(([a=2, b=5]=[]) => a+b)', expected: [6, 7]                             },
  {expr: '[{a:1}].map(({a}) => a)',                      expected: [1]                                },
  {expr: '[undefined].map(({a=1}={}) => a)',             expected: [1]                                },
  {expr: '[1, 2].map((a, ...b) => [a, b])',              expected: [ [1, [0,[1,2]]], [2, [1,[1,2]]] ] },
  {expr: '[{a:1,b:2,c:3}].map(({a, ...b}) => [a, b])',   expected: [[1, {b:2,c:3}]]                   },
  {expr: '[{a:1}].map(({...foo}) => foo.a)',             expected: [1]                                },

  // assignment/update
  {expr: 'a = 2', expected: 2, context: {a: 1}, expObj: {a: 2}},
  {expr: 'a += 2', expected: 3, context: {a: 1}, expObj: {a: 3}},
  {expr: 'a++', expected: 1, context: {a: 1}, expObj: {a: 2}},
  {expr: '++a', expected: 2, context: {a: 1}, expObj: {a: 2}},
  {expr: 'a--', expected: 1, context: {a: 1}, expObj: {a: 0}},
  {expr: '--a', expected: 0, context: {a: 1}, expObj: {a: 0}},
  {expr: 'a[0] = 3', expected: 3, context: {a: [0, 0]}, expObj: {a: [3, 0]}},

  // compound
  {expr: 'a=1; b=a; c=a+b;', expected: 2, context: {}, expObj: {a: 1, b: 1, c: 2}},

  // new
  {expr: '(new Date(2021, 8)).getFullYear()',             expected: 2021                          },
  {expr: '(new sub.sub2["Date"](2021, 8)).getFullYear()', expected: 2021                          },
  {expr: 'new Date(2021, 8)',                             expected: new Date(2021, 8) },

  // object, spread
  {expr: '{ a: "a", one, [foo.bar]: 2 }', expected: { a: 'a', one: 1, baz: 2 }        },
  {expr: '{ a: "a", ...numMap }',         expected: { a: 'a', 10: 'ten', 3: 'three' } },
  {expr: '[7, ...list]',                  expected: [7,1,2,3,4,5]                     },
  {expr: 'func(1, ...list)',              expected: 17                                },

  // regex
  {expr: '/123/', expected: /123/ },
  {expr: '/a/ig', expected: /a/ig },

  // template literals
  {expr: '`abc`',                             expected: 'abc'               },
  {expr: '`hi ${foo.bar}`',                   expected: 'hi baz'            },
  {expr: 'tag`hi ${list[0]} and ${list[3]}`', expected: 'hi , and ,,=>,1,4' },
];

export const syncFixtures = [
  // async/await
  {expr: 'await 2', expected: Promise.resolve(2)},
  {expr: 'await Promise.resolve(3)', expected: Promise.resolve(3)},
  {expr: 'await asyncFunc(1, 2)', expected: Promise.resolve(3)},
  {expr: 'asyncFunc(1, 2)', expected: Promise.resolve(3)},
];

export const asyncFixtures = [
  {expr: 'asyncFunc(one, two)',   expected: 3},
  {expr: 'promiseFunc(one, two)', expected: 3},

  // async/await
  {expr: 'await 2', expected: 2},
  {expr: 'await Promise.resolve(3)', expected: 3},
  {expr: 'await asyncFunc(1, 2)', expected: 3},
  {expr: 'asyncFunc(1, 2)', expected: 3},
];
