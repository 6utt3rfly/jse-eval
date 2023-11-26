import { Context, Options, FunctionBindings, Scope } from './types';

export class Utils {

  public static getValue(obj: Context, name: string, 
    options?: Options): unknown | undefined {

    const keyValue: [string | number, unknown, string] | undefined = Utils.getScopedKeyValue(obj, name, options);
    if (typeof keyValue === 'undefined') {
      return undefined;
    }
    const [, value, scopeName] = keyValue;

    const fn = Utils.getBindFunction(value, name, options, scopeName);
    if (typeof fn === 'function') {
      return fn;
    }
      
    return value;
  }

  public static getScopePair(obj: unknown, name: string, 
    options?: Options): [string | number, Scope] | undefined{

    if (typeof obj !== 'undefined' && options?.scopes) {
      const keyValue = Utils.getKeyValue(options.scopes, name, options);
      if (typeof keyValue !== 'undefined') {
        const [key, value] = keyValue;
        if (value) {
          const scope: Scope = value;
          return [key, scope];
        }
      }
    }
    return undefined;
  }

  private static getBindFunction(obj: unknown, name: string, 
    options?: Options, scopeName?: string): ((...args: unknown[]) => unknown) | undefined {

    const scopedOptions = Utils.hasProperty(options?.scopes, scopeName) 
      ? options?.scopes[scopeName]?.options : options;
    
    if (typeof obj === 'function' && scopedOptions?.functionBindings) {
      const keyValue = Utils.getKeyValue(scopedOptions.functionBindings, name, options);
      if (typeof keyValue !== 'undefined') {
        const [, value] = keyValue;
        if (value) {
          const bindings: FunctionBindings = value;
          if (bindings?.arguments) {
            const args: unknown[] = bindings.arguments;
            const fn = obj.bind(bindings?.thisRef, ...args) as (...args: unknown[]) => unknown;
            return fn;
          } else {
            const fn = obj.bind(bindings?.thisRef) as (...args: unknown[]) => unknown;
            return fn;
          }
        }
      }
    }
    return undefined;
  }

  private static hasProperty(obj?: Context, name?: string): boolean {
    if (obj && name) {
      return Object.prototype.hasOwnProperty.call(obj, name) as boolean;
    }
    return false;
  }

  private static getScopedKeyValue(obj: Context, name: string | number, 
    options?: Options): [string | number, unknown, string] | undefined {

    const scopeNameList: string[] = [''];
    const currentScope = Utils.hasProperty(obj, options?.currentScopeName) && 
                         Utils.hasProperty(options?.scopes, options?.currentScopeName); 
    const globalScope = Utils.hasProperty(obj, options?.globalScopeName) && 
                        Utils.hasProperty(options?.scopes, options?.globalScopeName);

    if (currentScope) {
      scopeNameList.push(options?.currentScopeName);
    }
    if (globalScope) {
      scopeNameList.push(options?.globalScopeName);
    }

    for (const scopeName of scopeNameList) {
      const scopedObject = (scopeName ? obj[scopeName] : obj) as Context;
      const keyValue = this.getKeyValue(scopedObject, name, options);
      if (typeof keyValue !== 'undefined') {
        const [key, value] = keyValue;
        return [key, value, scopeName];
      }
    }

    return undefined;
  }

  public static getKeyValue(obj: Context, name: string | number, 
    options?: Options): [string | number, unknown] | undefined {

    Utils.blockListTest(obj, name, options);
    Utils.allowListTest(obj, name, options);

    if (options?.caseSensitive || typeof name !== 'string') {
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
            const value = currentObj[key];
            return [key, value];
          }
        }
      } while ((currentObj = Object.getPrototypeOf(currentObj)));
    }

    return undefined;
  }

  public static getLiteralKeyValue(obj: Context, name: string, 
    options?: Options): [string, unknown] | undefined {

    Utils.blockListTest(obj, name, options);
    Utils.allowListTest(obj, name, options);
  
    if (options?.caseSensitive) {
      return [name, obj[name]];
    } else {
      for (const [key, value] of Object.entries(obj)) {
        const found = key.localeCompare(name, 'en', { sensitivity: 'base' }) === 0;
        if (found) {
          return [key, value];
        }
      }
    }
    return undefined;
  }

  public static blockListTest(obj: Context, name: string | number, 
    options?: Options): void {

    if (options?.blockList && typeof name === 'string') {

      const find = options.caseSensitive 
        ? options.blockList.find(key => key === name)
        : options.blockList.find(key => key.localeCompare(name, 'en', { sensitivity: 'base' }) === 0);

      if (find) {
        throw Error(`Access to member "${name}" from blockList is not permitted.`);        
      }
    }
  }

  public static allowListTest(obj: Context, name: string | number, 
    options?: Options): void {

    if (options?.allowList && typeof name === 'string') {

      const find = options?.caseSensitive 
        ? options.allowList.find(key => key === name)
        : options.allowList.find(key => key.localeCompare(name, 'en', { sensitivity: 'base' }) === 0);

      if (!find) {
        throw Error(`Access to member "${name}" not in allowList is not permitted.`);        
      }
    }
  }

}
