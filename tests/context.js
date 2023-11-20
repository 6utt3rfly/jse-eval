export const context = {
  string: 'string',
  number: 123,
  bool: true,
  one: 1,
  two: 2,
  three: 3,
  foo: {bar: 'baz', baz: 'wow', func: function(x) { return this[x]; }},
  thisTestFn: function() { return this.two; },
  thisTestArrow: () => this,
  numMap: {10: 'ten', 3: 'three'},
  list: [1,2,3,4,5],
  func: function(...x) { return x.reduce((sum, v) => sum + v, 1); },
  isArray: Array.isArray,
  throw: () => { throw new Error('Should not be called.'); },
  Date,
  sub: { sub2: { Date } },
  tag: (strings, ...expand) => [...strings, '=>', ...expand].join(','),
  promise: (v) => Promise.resolve(v),
  Promise,
  asyncFunc: async (a, b) => await a + b,
  promiseFunc: (a, b) => new Promise((resolve, reject) => {
    setTimeout(() => resolve(a + b), 1000);
  }),
};

export const asyncContext = context;
