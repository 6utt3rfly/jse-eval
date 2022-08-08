import tape from 'tape';
import JseEval from '../dist/jse-eval.module.js';

tape('errors', async (t) => {
  const expectedMsg = /Access to member "\w+" disallowed/;
  t.throws(() => JseEval.compile(`o.__proto__`)({o: {}}), expectedMsg, '.__proto__');
  t.throws(() => JseEval.compile(`o.prototype`)({o: {}}), expectedMsg, '.prototype');
  t.throws(() => JseEval.compile(`o.constructor`)({o: {}}), expectedMsg, '.constructor');
  t.throws(() => JseEval.compile(`o['__proto__']`)({o: {}}), expectedMsg, '["__proto__"]');
  t.throws(() => JseEval.compile(`o['prototype']`)({o: {}}), expectedMsg, '["prototype"]');
  t.throws(() => JseEval.compile(`o['constructor']`)({o: {}}), expectedMsg, '["constructor"]');
  t.throws(() => JseEval.compile(`o[p]`)({o: {}, p: '__proto__'}), expectedMsg, '[~__proto__]');
  t.throws(() => JseEval.compile(`o[p]`)({o: {}, p: 'prototype'}), expectedMsg, '[~prototype]');
  t.throws(() => JseEval.compile(`o[p]`)({o: {}, p: 'constructor'}), expectedMsg, '[~constructor]');

  t.throws(() => JseEval.compile(`a.b`)({}), /of undefined/, 'b of undefined');
  t.throws(() => JseEval.compile(`a()`)({}), /'a' is not a function/, 'invalid function');
  t.throws(() => JseEval.compile(`a[b]()`)({a: 1, b: '2'}), /'b' is not a function/, 'invalid dynamic function');
  t.throws(() => JseEval.compile(`new a()`)({a: () => 1}), /not a constructor/, 'invalid new');
  t.throws(() => JseEval.compile('a:1')({a: 1}), /Unexpected ":"/);

  try {
    await JseEval.compileAsync('Promise.reject(new Error("abcd"))')({ Promise, Error });
    t.throws(() => {});
  } catch (e) {
    t.throws(() => { throw e; }, /abcd/, 'async rejection');
  }
});
