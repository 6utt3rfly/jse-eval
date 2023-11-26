export declare type Context = Record<string, unknown>;

export type FunctionBindings = {
  thisRef?: Context,
  arguments?: unknown[]
}

export type Scope = {
  options?: Options;
}

export type Options = {
  caseSensitive?: boolean;
  blockList?: string[];
  allowList?: string[];
  functionBindings?: Record<string, FunctionBindings>;
  scopes?: Record<string, Scope>;
  currentScopeName?: string;
  globalScopeName?: string;
}

export const literals: Context = {
  'undefined': undefined,
  'null': null,
  'true': true,
  'false': false,
}
