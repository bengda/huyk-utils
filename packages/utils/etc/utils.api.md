## API Report File for "@huyk-utils/utils"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

// Warning: (ae-missing-release-tag) "array2Tree" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function array2Tree<T extends object>(tree: Array<T>, options?: BuildTreeOptions): T[];

// Warning: (ae-missing-release-tag) "AsyncExecutionLimiter" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export class AsyncExecutionLimiter {
    constructor(params?: {
        limit?: number;
        race?: boolean;
    });
    // (undocumented)
    _acc(): number;
    // (undocumented)
    _blocks(): Array<(...args: any) => any>;
    // (undocumented)
    limit: number;
    // (undocumented)
    race: boolean;
    // (undocumented)
    run<T extends (...args: any) => any>(fn: T): Promise<Awaited<ReturnType<T>>>;
}

// Warning: (ae-missing-release-tag) "BaseTreeOptions" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export interface BaseTreeOptions {
    children?: string;
    id?: string;
    // (undocumented)
    onlyLeaf?: boolean;
}

// Warning: (ae-missing-release-tag) "BuildTreeOptions" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export interface BuildTreeOptions extends BaseTreeOptions {
    cloneData?: boolean;
    parentId?: string;
    throwErrorWhenHasTooMuchRootNodes?: boolean;
}

// Warning: (ae-missing-release-tag) "cloneData" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function cloneData<T>(target: T): T;

// Warning: (ae-missing-release-tag) "compareSemanticVersion" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function compareSemanticVersion(a: string, b: string): 0 | -1 | 1;

// Warning: (ae-missing-release-tag) "createAsyncLooper" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function createAsyncLooper<T>(params: {
    timeout?: number;
    delay?: number;
    handler(abort: () => void): Promise<T>;
}): () => Promise<T>;

// Warning: (ae-missing-release-tag) "DataTypeMapping" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export interface DataTypeMapping {
    // (undocumented)
    array: any[];
    // (undocumented)
    arraybuffer: ArrayBuffer;
    // (undocumented)
    bigint: bigint;
    // (undocumented)
    boolean: boolean;
    // (undocumented)
    date: Date;
    // (undocumented)
    function: (...args: any) => any;
    // (undocumented)
    map: Map<any, any>;
    // (undocumented)
    null: null;
    // (undocumented)
    number: number;
    // (undocumented)
    object: object;
    // (undocumented)
    promise: Promise<any>;
    // (undocumented)
    regexp: RegExp;
    // (undocumented)
    set: Set<any>;
    // (undocumented)
    string: string;
    // (undocumented)
    symbol: symbol;
    // (undocumented)
    undefined: undefined;
    // (undocumented)
    weakmap: WeakMap<any, any>;
    // (undocumented)
    weakref: WeakRef<any>;
    // (undocumented)
    weakset: WeakSet<any>;
}

// Warning: (ae-missing-release-tag) "decodeURI2Str" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function decodeURI2Str(uri: string): string;

// Warning: (ae-missing-release-tag) "delayResolve" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function delayResolve<T>(data: T): {
    after: (delay: number) => Promise<T>;
    cancel: () => void;
};

// Warning: (ae-missing-release-tag) "exist" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function exist(o: any, k?: string): boolean;

// Warning: (ae-missing-release-tag) "extendUrl" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function extendUrl(url: string, options?: {
    position: 'search' | 'hash';
    query?: Record<string, string | number>;
    remove?: (string | RegExp)[];
    encode?: boolean;
}): string;

// Warning: (ae-missing-release-tag) "extract" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function extract(o: any, k?: string): any;

// Warning: (ae-missing-release-tag) "formatString" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function formatString(inputStr: string, mapParams: Record<PropertyKey, any> | PropertyKey[]): string;

// Warning: (ae-missing-release-tag) "getTreeDepth" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function getTreeDepth(tree: object[], options?: SearchTreeOptions): number;

// Warning: (ae-missing-release-tag) "getTreeFullPath" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function getTreeFullPath<T extends object>(tree: T[], nodeId: string | number, options?: BaseTreeOptions): T[];

// Warning: (ae-missing-release-tag) "getTreeNodeDataById" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function getTreeNodeDataById<T extends object>(tree: T[], nodeId: string | number, options?: BaseTreeOptions): T | undefined;

// Warning: (ae-missing-release-tag) "getType" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function getType(arg: unknown): string;

// Warning: (ae-missing-release-tag) "getUrlQuery" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function getUrlQuery(url: string, options?: {
    position: 'search' | 'hash';
    decode?: boolean;
}): Record<string, string>;

// Warning: (ae-forgotten-export) The symbol "ImmutableStoreMap" needs to be exported by the entry point index.d.ts
// Warning: (ae-missing-release-tag) "ImmutableStore" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export class ImmutableStore<S extends ImmutableStoreMap = {}> {
    // (undocumented)
    [im_s_m]: S;
    // (undocumented)
    clone(): ImmutableStore<S>;
    // (undocumented)
    static create<SS extends ImmutableStoreMap = {}>(store?: SS): ImmutableStore<SS>;
    // Warning: (ae-forgotten-export) The symbol "ShallowMerge" needs to be exported by the entry point index.d.ts
    //
    // (undocumented)
    extend<U extends ImmutableStoreMap>(extens: U): ImmutableStore<ShallowMerge<S, U>>;
    // (undocumented)
    imut<K extends keyof S>(k: K, v: S[K]): ImmutableStore<S>;
    // (undocumented)
    imuts(kv: Partial<S>): ImmutableStore<S>;
    // (undocumented)
    query<T extends keyof S>(k: T): S[T];
    // (undocumented)
    set<K extends keyof S>(k: K, v: S[K]): this;
    // (undocumented)
    valueOf(): {} & S;
}

// Warning: (ae-missing-release-tag) "isArray" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function isArray<T>(arg: unknown): arg is Array<T>;

// Warning: (ae-missing-release-tag) "isBoolean" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function isBoolean(arg: unknown): arg is boolean;

// Warning: (ae-missing-release-tag) "isCircular" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function isCircular(target: any): boolean;

// Warning: (ae-missing-release-tag) "isComplex" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function isComplex(arg: unknown): arg is object;

// Warning: (ae-missing-release-tag) "isComplexButNotFunctionType" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function isComplexButNotFunctionType(arg: unknown): arg is object;

// Warning: (ae-missing-release-tag) "isDate" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function isDate(arg: unknown): arg is Date;

// Warning: (ae-missing-release-tag) "isDom" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function isDom(arg: unknown): arg is Window | Document | HTMLElement;

// Warning: (ae-missing-release-tag) "isEle" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function isEle(arg: unknown): arg is HTMLElement;

// Warning: (ae-missing-release-tag) "isEmptyObject" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function isEmptyObject(arg: unknown): arg is Record<PropertyKey, never>;

// Warning: (ae-missing-release-tag) "isFloatNumber" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function isFloatNumber(arg: unknown): arg is number;

// Warning: (ae-missing-release-tag) "isFunction" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function isFunction(arg: unknown): arg is (...args: any[]) => any;

// Warning: (ae-missing-release-tag) "isInteger" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function isInteger(arg: unknown): arg is number;

// Warning: (ae-missing-release-tag) "isLooseObject" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function isLooseObject(arg: unknown): arg is Record<PropertyKey, any>;

// Warning: (ae-missing-release-tag) "isNaN" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
function isNaN_2(arg: unknown): arg is number;
export { isNaN_2 as isNaN }

// Warning: (ae-missing-release-tag) "isNull" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function isNull(arg: unknown): arg is null;

// Warning: (ae-missing-release-tag) "isNullOrUndefined" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function isNullOrUndefined(arg: unknown): arg is null | undefined;

// Warning: (ae-missing-release-tag) "isNumber" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function isNumber(arg: unknown): arg is number;

// Warning: (ae-missing-release-tag) "isNumeric" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function isNumeric(arg: unknown): arg is string | number;

// Warning: (ae-missing-release-tag) "isObject" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function isObject(arg: unknown): arg is Record<PropertyKey, any>;

// Warning: (ae-missing-release-tag) "isPlainObject" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function isPlainObject(arg: unknown): arg is Record<PropertyKey, any>;

// Warning: (ae-missing-release-tag) "isPrimitive" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function isPrimitive(arg: unknown): arg is null | undefined | number | string | boolean | symbol;

// Warning: (ae-missing-release-tag) "isStrictObject" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function isStrictObject(arg: unknown): arg is Record<PropertyKey, any>;

// Warning: (ae-missing-release-tag) "isString" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function isString(arg: unknown): arg is string;

// Warning: (ae-missing-release-tag) "isSymbol" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function isSymbol(arg: unknown): arg is symbol;

// Warning: (ae-missing-release-tag) "isType" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function isType<T extends keyof DataTypeMapping>(input: any, type: T): input is DataTypeMapping[T];

// Warning: (ae-missing-release-tag) "isUndefined" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function isUndefined(arg: unknown): arg is undefined;

// Warning: (ae-missing-release-tag) "isValidDateArg" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function isValidDateArg(arg: unknown): arg is string | Date | number;

// Warning: (ae-missing-release-tag) "makeGetterSetter" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function makeGetterSetter<T>(defalutValue: T): [() => T, (newVal: T) => T];

// Warning: (ae-missing-release-tag) "maybeFloatNumber" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function maybeFloatNumber(arg: unknown): arg is string | number;

// Warning: (ae-missing-release-tag) "maybeInteger" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function maybeInteger(arg: unknown): arg is string | number;

// Warning: (ae-missing-release-tag) "nonNullable" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function nonNullable<T extends object>(obj: T): {
    [K in keyof T]-?: NonNullable<T[K]>;
};

// Warning: (ae-missing-release-tag) "objectKeyPathValue" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function objectKeyPathValue(o: object): Array<{
    path: string[];
    value: any;
}>;

// Warning: (ae-missing-release-tag) "omit" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function omit<T extends object, K extends keyof T>(obj: T, fields: readonly K[]): Omit<T, (typeof fields)[number]>;

// Warning: (ae-missing-release-tag) "pick" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function pick<T extends object, K extends keyof T>(obj: T, fields: readonly K[]): Pick<T, (typeof fields)[number]>;

// Warning: (ae-missing-release-tag) "safeParse" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function safeParse(obj: any, fallbackValue?: {}): any;

// Warning: (ae-missing-release-tag) "searchTree" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function searchTree<T extends object>(tree: T[], cond: (node: T) => boolean, options?: SearchTreeOptions): T[];

// Warning: (ae-missing-release-tag) "SearchTreeOptions" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export type SearchTreeOptions = Omit<BaseTreeOptions, 'id'>;

// Warning: (ae-missing-release-tag) "tree2Array" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function tree2Array<T extends object>(tree: T[], options?: SearchTreeOptions): T[];

// Warning: (ae-forgotten-export) The symbol "WalkTreeNodeInfo" needs to be exported by the entry point index.d.ts
// Warning: (ae-missing-release-tag) "walkTree" is part of the package's API, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function walkTree<T extends object>(tree: T[], visit: (node: T, nodeInfo: WalkTreeNodeInfo<T>, stopWalk: () => void, stopWalkChildren: () => void) => any, options?: SearchTreeOptions): any;

// (No @packageDocumentation comment for this package)

```