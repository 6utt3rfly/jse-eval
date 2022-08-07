import { ArrowExpression } from '@jsep-plugin/arrow';
import { AssignmentExpression, UpdateExpression } from '@jsep-plugin/assignment';
import { AwaitExpression } from '@jsep-plugin/async-await';
import { NewExpression } from '@jsep-plugin/new';
import { ObjectExpression, Property } from '@jsep-plugin/object';
import { SpreadElement } from '@jsep-plugin/spread';
import { TaggedTemplateExpression, TemplateLiteral } from '@jsep-plugin/template';
import jsep from 'jsep';

/**
 * Evaluation code from JSEP project, under MIT License.
 * Copyright (c) 2013 Stephen Oney, http://jsep.from.so/
 */

export declare type Context = Record<string, unknown>;
export declare type ContextOrObject = Record<string, unknown> | object;
export declare type operand = any;
export declare type unaryCallback = (a: operand) => operand;
export declare type binaryCallback = (a: operand, b: operand) => operand;
export declare type assignCallback = (obj: Record<string, operand>, key: string, val: operand) => operand;
export declare type evaluatorCallback<T extends AnyExpression> = (this: ExpressionEval, node: T, context?: Context) => unknown;

export type AnyExpression = jsep.Expression;

export type JseEvalPlugin = Partial<jsep.IPlugin> & {
  initEval?: (this: typeof ExpressionEval, jseEval: typeof ExpressionEval) => void;
}

export type EvalOptions = {
  caseSensitive?: boolean;
  blockList?: string[];
  allowList?: string[];
}

const literals: Map<string, unknown> = new Map([
  ['undefined', undefined],
  ['null', null],
  ['true', true],
  ['false', false],
]);

export default class ExpressionEval {
  static jsep = jsep;
  static parse = jsep;
  static evaluate = ExpressionEval.eval;

  static evaluators: Record<string, evaluatorCallback<AnyExpression>> = {
    'ArrayExpression': ExpressionEval.prototype.evalArrayExpression,
    'LogicalExpression': ExpressionEval.prototype.evalBinaryExpression,
    'BinaryExpression': ExpressionEval.prototype.evalBinaryExpression,
    'CallExpression': ExpressionEval.prototype.evalCallExpression,
    'Compound': ExpressionEval.prototype.evalCompoundExpression,
    'ConditionalExpression': ExpressionEval.prototype.evalConditionalExpression,
    'Identifier': ExpressionEval.prototype.evalIdentifier,
    'Literal': ExpressionEval.evalLiteral,
    'OptionalMemberExpression': ExpressionEval.prototype.evalMemberExpression, // acorn uses this
    'MemberExpression': ExpressionEval.prototype.evalMemberExpression,
    'ThisExpression': ExpressionEval.prototype.evalThisExpression,
    'UnaryExpression': ExpressionEval.prototype.evalUnaryExpression,
    'ArrowFunctionExpression': ExpressionEval.prototype.evalArrowFunctionExpression,
    'AssignmentExpression': ExpressionEval.prototype.evalAssignmentExpression,
    'UpdateExpression': ExpressionEval.prototype.evalUpdateExpression,
    'AwaitExpression': ExpressionEval.prototype.evalAwaitExpression,
    'NewExpression': ExpressionEval.prototype.evalNewExpression,
    'ObjectExpression': ExpressionEval.prototype.evalObjectExpression,
    'SpreadElement': ExpressionEval.prototype.evalSpreadElement,
    'TaggedTemplateExpression': ExpressionEval.prototype.evalTaggedTemplateExpression,
    'TemplateLiteral': ExpressionEval.prototype.evalTemplateLiteral,
  };

  // Default operator precedence from https://github.com/EricSmekens/jsep/blob/master/src/jsep.js#L55
  static DEFAULT_PRECEDENCE: Record<string, number> = {
    '||': 1,
    '&&': 2,
    '|': 3,
    '^': 4,
    '&': 5,
    '==': 6,
    '!=': 6,
    '===': 6,
    '!==': 6,
    '<': 7,
    '>': 7,
    '<=': 7,
    '>=': 7,
    '<<': 8,
    '>>': 8,
    '>>>': 8,
    '+': 9,
    '-': 9,
    '*': 10,
    '/': 10,
    '%': 10
  };

  static binops: Record<string, binaryCallback> = {
    '||': function (a, b) { return a || b; },
    '&&': function (a, b) { return a && b; },
    '|': function (a, b) { return a | b; },
    '^': function (a, b) { return a ^ b; },
    '&': function (a, b) { return a & b; },
    '==': function (a, b) { return a == b; }, // jshint ignore:line
    '!=': function (a, b) { return a != b; }, // jshint ignore:line
    '===': function (a, b) { return a === b; },
    '!==': function (a, b) { return a !== b; },
    '<': function (a, b) { return a < b; },
    '>': function (a, b) { return a > b; },
    '<=': function (a, b) { return a <= b; },
    '>=': function (a, b) { return a >= b; },
    '<<': function (a, b) { return a << b; },
    '>>': function (a, b) { return a >> b; },
    '>>>': function (a, b) { return a >>> b; },
    '+': function (a, b) { return a + b; },
    '-': function (a, b) { return a - b; },
    '*': function (a, b) { return a * b; },
    '/': function (a, b) { return a / b; },
    '%': function (a, b) { return a % b; }
  };

  static unops: Record<string, unaryCallback> = {
    '-': function (a) { return -a; },
    '+': function (a) { return +a; },
    '~': function (a) { return ~a; },
    '!': function (a) { return !a; },
  };

  static assignOps: Record<string, assignCallback> = {
    '=': function(obj, key, val) { return obj[key] = val; },
    '*=': function(obj, key, val) { return obj[key] *= val; },
    '**=': function(obj, key, val) { return obj[key] **= val; },
    '/=': function(obj, key, val) { return obj[key] /= val; },
    '%=': function(obj, key, val) { return obj[key] %= val; },
    '+=': function(obj, key, val) { return obj[key] += val; },
    '-=': function(obj, key, val) { return obj[key] -= val; },
    '<<=': function(obj, key, val) { return obj[key] <<= val; },
    '>>=': function(obj, key, val) { return obj[key] >>= val; },
    '>>>=': function(obj, key, val) { return obj[key] >>>= val; },
    '&=': function(obj, key, val) { return obj[key] &= val; },
    '^=': function(obj, key, val) { return obj[key] ^= val; },
    '|=': function(obj, key, val) { return obj[key] |= val; },
  };

  static defaultOptions: EvalOptions = {
    caseSensitive: true
  }

  // inject Custom Unary Operators (and override existing ones)
  static addUnaryOp(operator: string, _function: unaryCallback): void {
    jsep.addUnaryOp(operator);
    ExpressionEval.unops[operator] = _function;
  }

  // inject Custom Binary Operators (and override existing ones)
  static addBinaryOp(
    operator: string,
    precedence_or_fn: number | binaryCallback,
    _ra_or_callback?: boolean | binaryCallback,
    _function?: binaryCallback)
    : void {
    let precedence, ra, cb;
    if (typeof precedence_or_fn === 'function') {
      cb = precedence_or_fn;
    } else {
      precedence = precedence_or_fn;
      if (typeof _ra_or_callback === 'function') {
        cb = _ra_or_callback;
      } else {
        ra = _ra_or_callback;
        cb = _function;
      }
    }

    jsep.addBinaryOp(operator, precedence || 1, ra);
    ExpressionEval.binops[operator] = cb;
  }

  // inject custom node evaluators (and override existing ones)
  static addEvaluator<T extends AnyExpression>(nodeType: string, evaluator: evaluatorCallback<T>): void {
    ExpressionEval.evaluators[nodeType] = evaluator;
  }

  static registerPlugin(...plugins: Array<JseEvalPlugin>) {
    plugins.forEach((p) => {
      if (p.init) {
        ExpressionEval.parse.plugins.register(p as jsep.IPlugin);
      }
      if (p.initEval) {
        p.initEval.call(ExpressionEval, ExpressionEval);
      }
    });
  }

  // inject default Options
  static addOptions(options: EvalOptions): void {
    ExpressionEval.defaultOptions = options;
  }

  // main evaluator method
  static eval(ast: jsep.Expression, context?: Context, options?: EvalOptions): unknown {
    return (new ExpressionEval(context, undefined, options)).eval(ast);
  }
  static async evalAsync(ast: jsep.Expression, context?: Context, options?: EvalOptions): Promise<unknown> {
    return (new ExpressionEval(context, true, options)).eval(ast);
  }

  // compile an expression and return an evaluator
  static compile(expression: string): (context?: Context) => unknown {
    return ExpressionEval.eval.bind(null, ExpressionEval.jsep(expression));
  }
  static compileAsync(expression: string): (context?: Context) => Promise<unknown> {
    return ExpressionEval.evalAsync.bind(null, ExpressionEval.jsep(expression));
  }

  // compile and evaluate
  static evalExpr(expression: string, context?: Context): unknown {
    return ExpressionEval.compile(expression)(context);
  }
  static evalExprAsync(expression: string, context?: Context): unknown {
    return ExpressionEval.compileAsync(expression)(context);
  }


  context?: Context;
  isAsync?: boolean;
  options?: EvalOptions;

  get caseSensitive() {
    return !!(this.options && this.options.caseSensitive);
  }

  constructor(context?: Context, isAsync?: boolean, options?: EvalOptions) {
    this.context = context;
    this.isAsync = isAsync;
    this.options = options || ExpressionEval.defaultOptions;
  }

  public eval(node: unknown, cb = v => v): unknown {
    const evaluator = ExpressionEval.evaluators[(node as jsep.Expression).type]
      || ExpressionEval.evaluators.default;
    if (!evaluator) {
      throw new Error(`unknown node type: ${JSON.stringify(node, null, 2)}`);
    }
    return this.evalSyncAsync(evaluator.bind(this)(node, this.context), (v) => {
      (node as any)._value = v;
      return cb(v);
    });
  }

  /*
   * `evalSyncAsync` is a helper to wrap sync/async calls into one so that
   * we don't have to duplicate all of our node type parsers.
   * It's basically like old node callback (hell?), but it works because:
   * for sync:
   *   an expression like `[1].map(v => v + 1)` returns the result
   *   after running the callback
   * for async:
   *   an expression like `const a = (await x) + 1` is equivalent to
   *   `Promise.resolve(x).then(res => res + 1)`
   *
   * Note: For optimization, there are a few places where it makes sense
   * to directly check `this.isAsync` to use Promise.all(),
   * `promisesOrResults = expressions.map(v => this.eval(v))`
   *   could result in an array of results (sync) or promises (async)
   */
  evalSyncAsync(val: unknown, cb: (unknown) => unknown): Promise<unknown> | unknown {
    if (this.isAsync) {
      return Promise.resolve(val).then(cb);
    }
    return cb(val);
  }

  private evalArrayExpression(node: jsep.ArrayExpression) {
    return this.evalArray(node.elements);
  }

  protected evalArray(list: jsep.Expression[]): unknown[] {
    const mapped = list.map(v => this.eval(v));
    const toFullArray = (res) => res
      .reduce((arr, v, i) => {
        if ((list[i] as AnyExpression).type === 'SpreadElement') {
          return [...arr, ...v];
        }
        arr.push(v);
        return arr;
      }, []);
    return this.isAsync
      ? Promise.all(mapped).then(toFullArray)
      : toFullArray(mapped);
  }

  private evalBinaryExpression(node: jsep.BinaryExpression) {
    if (node.operator === '||') {
      return this.eval(node.left, left => left || this.eval(node.right));
    } else if (node.operator === '&&') {
      return this.eval(node.left, left => left && this.eval(node.right));
    }
    const leftRight = [
      this.eval(node.left),
      this.eval(node.right)
    ];
    const op = ([left, right]) => ExpressionEval
      .binops[node.operator](left, right);
    return this.isAsync
      ? Promise.all(leftRight).then(op)
      : op(leftRight as [operand, operand]);
  }

  private evalCompoundExpression(node: jsep.Compound) {
    return this.isAsync
      ? node.body.reduce((p: Promise<any>, node) => p.then(() => this.eval(node)), Promise.resolve())
      : node.body.map(v => this.eval(v))[node.body.length - 1]
  }

  private evalCallExpression(node: jsep.CallExpression) {
    return this.evalSyncAsync(this.evalCall(node.callee), ([fn, caller]) => this
      .evalSyncAsync(this.evalArray(node.arguments), args => fn
        .apply(caller, args)));
  }

  protected evalCall(callee: jsep.Expression): unknown {
    if (callee.type === 'MemberExpression') {
      return this.evalSyncAsync(
        this.evaluateMember(callee as jsep.MemberExpression),
        ([caller, fn]) => ExpressionEval.validateFnAndCall(fn, caller, callee as AnyExpression)
      );
    }
    return this.eval(callee, fn => ExpressionEval.validateFnAndCall(fn, callee as AnyExpression));
  }

  private evalConditionalExpression(node: jsep.ConditionalExpression) {
    return this.eval(node.test, v => v
      ? this.eval(node.consequent)
      : this.eval(node.alternate));
  }

  private evalIdentifier(node: jsep.Identifier) {
    if (this.caseSensitive) {
      return this.context[node.name];
    } else if (node.name.localeCompare('this', 'en', { sensitivity: 'base' }) === 0) {
      return this.evalThisExpression();
    } else {
      const literal = ExpressionEval.getLiteralPair(literals, node.name, this.options);
      if (literal) {
        const [, value] = literal;
        return value;
      }
      const value = ExpressionEval.getValue(this.context, node.name, this.options);
      return value;
    }
  }

  private static evalLiteral(node: jsep.Literal) {
    return node.value;
  }

  private evalMemberExpression(node: jsep.MemberExpression) {
    return this.evalSyncAsync(this.evaluateMember(node), ([, val]) => val);
  }

  private evaluateMember(node: jsep.MemberExpression) {
    return this.eval(node.object, (object) => this
      .evalSyncAsync(
        node.computed
          ? this.eval(node.property)
          : (node.property as jsep.Identifier).name,
        (key: string) => {
          if (/^__proto__|prototype|constructor$/.test(key)) {
            throw Error(`Access to member "${key}" disallowed.`);
          }
          const obj = (node.optional ? (object || {}) : object);
          const value = ExpressionEval.getValue(obj, key, this.options);
          return [object, value, key];
        })
    );
  }

  private evalThisExpression() {
    return this.context;
  }

  private evalUnaryExpression(node: jsep.UnaryExpression) {
    return this.eval(node.argument, arg => ExpressionEval
      .unops[node.operator](arg));
  }

  private evalArrowFunctionExpression(node: ArrowExpression) {
    if (this.isAsync !== node.async) {
      return ExpressionEval[node.async ? 'evalAsync' : 'eval'](node as any, this.context);
    }
    return (...arrowArgs) => {
      const arrowContext = this.evalArrowContext(node, arrowArgs);
      return ExpressionEval[node.async ? 'evalAsync' : 'eval'](node.body, arrowContext);
    };
  }

  private evalArrowContext(node: ArrowExpression, arrowArgs): Context {
    const arrowContext = { ...this.context };

    ((node.params as AnyExpression[]) || []).forEach((param, i) => {
      // default value:
      if (param.type === 'AssignmentExpression') {
        if (arrowArgs[i] === undefined) {
          arrowArgs[i] = this.eval(param.right);
        }
        param = param.left as AnyExpression;
      }

      if (param.type === 'Identifier') {
        arrowContext[(param as jsep.Identifier).name] = arrowArgs[i];
      } else if (param.type === 'ArrayExpression') {
        // array destructuring
        (param.elements as AnyExpression[]).forEach((el, j) => {
          let val = arrowArgs[i][j];
          if (el.type === 'AssignmentExpression') {
            if (val === undefined) {
              // default value
              val = this.eval(el.right);
            }
            el = el.left as AnyExpression;
          }

          if (el.type === 'Identifier') {
            arrowContext[(el as jsep.Identifier).name] = val;
          } else {
            throw new Error('Unexpected arrow function argument');
          }
        });
      } else if (param.type === 'ObjectExpression') {
        // object destructuring
        const keys = [];
        (param.properties as AnyExpression[]).forEach((prop) => {
          let p = prop;
          if (p.type === 'AssignmentExpression') {
            p = p.left as AnyExpression;
          }

          let key;
          if (p.type === 'Property') {
            key = (<jsep.Expression>p.key).type === 'Identifier'
              ? (p.key as jsep.Identifier).name
              : this.eval(p.key).toString();
          } else if (p.type === 'Identifier') {
            key = p.name;
          } else if (p.type === 'SpreadElement' && (<jsep.Expression>p.argument).type === 'Identifier') {
            key = (p.argument as jsep.Identifier).name;
          } else {
            throw new Error('Unexpected arrow function argument');
          }

          let val = arrowArgs[i][key];
          if (p.type === 'SpreadElement') {
            // all remaining object properties. Copy arg obj, then delete from our copy
            val = { ...arrowArgs[i] };
            keys.forEach((k) => {
              delete val[k];
            });
          } else if (val === undefined && prop.type === 'AssignmentExpression') {
            // default value
            val = this.eval(prop.right);
          }

          arrowContext[key] = val;
          keys.push(key);
        });
      } else if (param.type === 'SpreadElement' && (<jsep.Expression>param.argument).type === 'Identifier') {
        const key = (param.argument as jsep.Identifier).name;
        arrowContext[key] = arrowArgs.slice(i);
      } else {
        throw new Error('Unexpected arrow function argument');
      }
    });
    return arrowContext;
  }

  private evalAssignmentExpression(node: AssignmentExpression) {
    return this.evalSyncAsync(
      this.getContextAndKey(node.left as AnyExpression),
      ([destObj, destKey]) => this.eval(node.right, right => ExpressionEval
        .assignOps[node.operator](destObj, destKey, right))
    );
  }

  private evalUpdateExpression(node: UpdateExpression) {
    return this.evalSyncAsync(
      this.getContextAndKey(node.argument as AnyExpression),
      ([destObj, destKey]) => ExpressionEval
        .evalUpdateOperation(node, destObj, destKey)
    );
  }

  private evalAwaitExpression(node: AwaitExpression) {
    return ExpressionEval.evalAsync(node.argument, this.context);
  }

  private static evalUpdateOperation(node: UpdateExpression, destObj, destKey) {
    if (node.prefix) {
      return node.operator === '++'
        ? ++destObj[destKey]
        : --destObj[destKey];
    }
    return node.operator === '++'
      ? destObj[destKey]++
      : destObj[destKey]--;
  }

  private getContextAndKey(node: AnyExpression) {
    if (node.type === 'MemberExpression') {
      return this.evalSyncAsync(
        this.evaluateMember(<jsep.MemberExpression>node),
        ([obj, , key]) => {
          const [newKey, ] = ExpressionEval.getKeyValuePair(obj, key, this.options);
          return [obj, newKey];
        }
      );
    } else if (node.type === 'Identifier') {
      const [key, ] = ExpressionEval.getKeyValuePair(this.context, node.name as string | number, this.options);
      return [this.context, key];
    } else if (node.type === 'ConditionalExpression') {
      return this.eval(node.test, test => this
        .getContextAndKey((test
          ? node.consequent
          : node.alternate) as AnyExpression));
    } else {
      throw new Error('Invalid Member Key');
    }
  }

  private evalNewExpression(node: NewExpression) {
    return this.evalSyncAsync(
      this.evalCall(node.callee),
      ([ctor]) => this.evalSyncAsync(
        this.evalArray(node.arguments),
        args => ExpressionEval.construct(ctor, args, node)));
  }

  private evalObjectExpression(node: ObjectExpression) {
    const obj = {};
    const arr = node.properties.map((prop: Property | SpreadElement) => {
      if (prop.type === 'SpreadElement') {
        // always synchronous in this case
        Object.assign(obj, ExpressionEval.eval(prop.argument, this.context, this.options));
      } else if (prop.type === 'Property') {
        return this.evalSyncAsync(
          prop.key.type === 'Identifier'
            ? (<jsep.Identifier>prop.key).name
            : this.eval(prop.key),
          key => this.eval(
            prop.shorthand ? prop.key : prop.value,
            val => { obj[key] = val; }
          )
        );
      }
    });
    return this.isAsync
      ? Promise.all(arr).then(() => obj)
      : obj;
  }

  private evalSpreadElement(node: SpreadElement) {
    return this.eval(node.argument);
  }

  private evalTaggedTemplateExpression(node: TaggedTemplateExpression) {
    const fnAndArgs = [
      this.evalCall(node.tag),
      this.evalSyncAsync(
        this.evalArray(node.quasi.expressions),
        exprs => [
          node.quasi.quasis.map(q => q.value.cooked),
          ...exprs,
        ]
      ),
    ];
    const apply = ([[fn, caller], args]) => fn.apply(caller, args);
    return this.isAsync
      ? Promise.all(fnAndArgs).then(apply)
      : apply(fnAndArgs as [[() => unknown, AnyExpression], unknown]);
  }

  private evalTemplateLiteral(node: TemplateLiteral) {
    return this.evalSyncAsync(
      this.evalArray(node.expressions),
      expressions => node.quasis.reduce((str, q, i) => {
        str += q.value.cooked;
        if (!q.tail) {
          str += expressions[i];
        }
        return str;
      }, '')
    );
  }

  protected static construct(
    ctor: () => unknown,
    args: unknown[],
    node: jsep.CallExpression | jsep.Expression
  ): unknown {
    try {
      return new (Function.prototype.bind.apply(ctor, [null].concat(args)))();
    } catch (e) {
      throw new Error(`${ExpressionEval.nodeFunctionName(node.callee as AnyExpression)} is not a constructor`);
    }
  }

  protected static validateFnAndCall(
    fn: () => unknown,
    callee?: AnyExpression,
    caller?: AnyExpression,
  ): [() => unknown, AnyExpression] {
    if (typeof fn !== 'function') {
      if (!fn && caller && caller.optional) {
        return [() => undefined, callee];
      }
      const name = ExpressionEval.nodeFunctionName(caller || callee);
      throw new Error(`'${name}' is not a function`);
    }
    return [fn, callee];
  }

  protected static nodeFunctionName(callee: AnyExpression): string {
    return callee
      && ((callee as jsep.Identifier).name
        || ((callee as jsep.MemberExpression).property
          && ((callee as jsep.MemberExpression).property as jsep.Identifier).name));
  }

  private static getValue(obj: ContextOrObject, name: string, options: EvalOptions): unknown {

    const [, value] = ExpressionEval.getKeyValuePair(obj, name, options);

    return value;
  }

  private static getKeyValuePair(obj: ContextOrObject, name: string | number, 
    options: EvalOptions): [string | number, unknown] {

    ExpressionEval.blockListTest(obj, name, options);
    ExpressionEval.allowListTest(obj, name, options);

    if (options.caseSensitive || typeof name !== 'string') {
      const value = obj[name];
      return [name, value];
    }

    if (typeof name === 'string') {
      let currentObj = obj;
      do {
        const keys: string[] = Object.getOwnPropertyNames(currentObj);
        if (Array.isArray(keys)) {
          const key = keys.find(key => key.localeCompare(name, 'en', { sensitivity: 'base' }) === 0);
          if (key) {
            const value = obj[key];
            return [key, value];
          }
        }
      } while ((currentObj = Object.getPrototypeOf(currentObj)));
    }

    return [name, undefined];
  }

  private static getLiteralPair(map: Map<string, unknown>, name: string, options: EvalOptions): [string, unknown] {

    ExpressionEval.blockListTest(map, name, options);
    ExpressionEval.allowListTest(map, name, options);
  
    if (options.caseSensitive) {
      return map[name];
    } else {
      for (const [key, value] of map) {
        const found = key.localeCompare(name, 'en', { sensitivity: 'base' }) === 0;
        if (found) {
          return [key, value];
        }
      }
    }
  }

  private static blockListTest(obj: ContextOrObject, name: string | number, 
    options: EvalOptions): void {
    if (options.blockList && typeof name === 'string') {

      const find = options.caseSensitive 
        ? options.blockList.find(key => key === name)
        : options.blockList.find(key => key.localeCompare(name, 'en', { sensitivity: 'base' }) === 0);

      if (find) {
        throw Error(`Access to member "${name}" from blockList disallowed.`);        
      }
    }
  }

  private static allowListTest(obj: ContextOrObject, name: string | number, 
    options: EvalOptions): void {
    if (options.allowList && typeof name === 'string') {

      const find = options.caseSensitive 
        ? options.allowList.find(key => key === name)
        : options.allowList.find(key => key.localeCompare(name, 'en', { sensitivity: 'base' }) === 0);

      if (!find) {
        throw Error(`Access to member "${name}" not in allowList disallowed.`);        
      }
    }
  }
}

/** NOTE: exporting named + default.
 * For CJS, these match the static members of the default export, so they still work.
 */
export { default as jsep, default as parse } from 'jsep';
export const DEFAULT_PRECEDENCE = ExpressionEval.DEFAULT_PRECEDENCE;
export const evaluators = ExpressionEval.evaluators;
export const binops = ExpressionEval.binops;
export const unops = ExpressionEval.unops;
export const assignOps = ExpressionEval.assignOps;
export const addUnaryOp = ExpressionEval.addUnaryOp;
export const addBinaryOp = ExpressionEval.addBinaryOp;
export const addEvaluator = ExpressionEval.addEvaluator;
export const registerPlugin = ExpressionEval.registerPlugin;
export const addOptions = ExpressionEval.addOptions;
export const evaluate = ExpressionEval.eval;
export const evalAsync = ExpressionEval.evalAsync;
export const compile = ExpressionEval.compile;
export const compileAsync = ExpressionEval.compileAsync;
export const evalExpr = ExpressionEval.evalExpr;
export const evalExprAsync = ExpressionEval.evalExprAsync;
