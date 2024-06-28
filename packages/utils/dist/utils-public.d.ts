/**
 * 将数组组装成一颗树
 * @template T
 * @param {T[]} data - 一个一维数组
 * @param {BuildTreeOptions} [options]
 * @param {string} [options.id] - 唯一id的属性名。默认: `id`
 * @param {string} [options.parentId] - 指定父级id的属性名。默认: `parentId`
 * @param {string} [options.children] - 指定子级的属性名。默认: `children`
 * @example
 *
 const data = [
 {
 parent_id: 1,
 id: 2,
 name: 'b',
 },
 {
 parent_id: 2,
 id: 3,
 name: 'c',
 },
 {
 parent_id: null,
 id: 1,
 name: 'a',
 },
 {
 parent_id: 2,
 id: 4,
 name: 'd',
 },
 {
 parent_id: 1,
 id: 5,
 name: 'e',
 },
 {
 parent_id: 3,
 id: 6,
 name: 'f',
 },
 {
 parent_id: 8,
 id: 7,
 name: 'ss',
 },
 {
 parent_id: 1,
 id: 8,
 name: 'dfs',
 },
 ];

 arrayToTree(data, {
 id: 'id',
 parentId: 'parent_id',
 children: 'children'
 })
 // 返回结果为
 [
 {
 "children": [
 {
 "children": [
 {
 "children": [
 {
 "children": [],
 "id": 6,
 "name": "f",
 "parent_id": 3
 }
 ],
 "id": 3,
 "name": "c",
 "parent_id": 2
 },
 {
 "children": [],
 "id": 4,
 "name": "d",
 "parent_id": 2
 }
 ],
 "id": 2,
 "name": "b",
 "parent_id": 1
 },
 {
 "children": [],
 "id": 5,
 "name": "e",
 "parent_id": 1
 },
 {
 "children": [
 {
 "children": [],
 "id": 7,
 "name": "ss",
 "parent_id": 8
 }
 ],
 "id": 8,
 "name": "dfs",
 "parent_id": 1
 }
 ],
 "id": 1,
 "name": "a",
 "parent_id": null
 }
 ]
 *
 */
export declare function array2Tree<T extends object>(tree: Array<T>, options?: BuildTreeOptions): T[];

/**
 * 异步并发控制器
 */
export declare class AsyncExecutionLimiter {
    /**
     * @public
     */
    limit: number;
    /**
     * @public
     */
    race: boolean;
    constructor(params?: {
        /**
         * 并发数
         */
        limit?: number;
        /**
         * 是否使用竞态模式，如果当前操作完成了，那么跳过中间的阻塞任务（相当于会永远处于`pending`状态），直接执行最后一个任务
         */
        race?: boolean;
    });
    _acc(): number;
    _blocks(): Array<(...args: any) => any>;
    /**
     * @public
     */
    run<T extends (...args: any) => any>(fn: T): Promise<Awaited<ReturnType<T>>>;
}

export declare interface BaseTreeOptions {
    /**
     * id映射键名。
     *
     * @default id
     */
    id?: string;
    /**
     * 子级键名映射。
     *
     * @default children
     */
    children?: string;
    onlyLeaf?: boolean;
}

export declare interface BuildTreeOptions extends BaseTreeOptions {
    /**
     * 指定父级id的属性名。
     *
     * @default parentId
     */
    parentId?: string;
    /**
     * 当有多个根节点抛出错误
     * @default true
     */
    throwErrorWhenHasTooMuchRootNodes?: boolean;
    /**
     * 是否克隆原始数据
     * @default true
     */
    cloneData?: boolean;
}

/**
 * 简单的数据克隆
 *
 * 如果目标是循环对象会抛出错误
 */
export declare function cloneData<T>(target: T): T;

/**
 * 比较两个版本号
 *
 * - 如果 a < b 返回 - 1
 * - 如果 a > b 返回 1
 * - 如果 a 和 b 相等返回 0
 */
export declare function compareSemanticVersion(a: string, b: string): 0 | -1 | 1;

/**
 * 创建自动循环执行函数
 */
export declare function createAsyncLooper<T>(params: {
    /**
     * 超时时间（毫秒）
     * @default 3000
     */
    timeout?: number;
    /**
     * 请求间隔时间（毫秒）
     * @default 500
     */
    delay?: number;
    handler(abort: () => void): Promise<T>;
}): () => Promise<T>;

export declare interface DataTypeMapping {
    number: number;
    string: string;
    object: object;
    array: any[];
    boolean: boolean;
    function: (...args: any) => any;
    symbol: symbol;
    promise: Promise<any>;
    null: null;
    undefined: undefined;
    map: Map<any, any>;
    weakmap: WeakMap<any, any>;
    set: Set<any>;
    weakset: WeakSet<any>;
    weakref: WeakRef<any>;
    arraybuffer: ArrayBuffer;
    bigint: bigint;
    regexp: RegExp;
    date: Date;
}

/**
 * 递归解码字符串
 *
 * 无论使用`encodeURIComponent`编码多少次都可以拿到最终的字符串
 * @example
 * ```ts
 * const s = encodeURIComponent(encodeURIComponent(JSON.stringify({ foo: '%95' })));
 * decodeURI2Str(s); // '{"foo":"%95"}'
 * ```
 */
export declare function decodeURI2Str(uri: string): string;

/**
 * 延时取值
 * @example
 * ```ts
 * delayResolve(1).after(1000);
 * ```
 */
export declare function delayResolve<T>(data: T): {
    after: (delay: number) => Promise<T>;
    cancel: () => void;
};

/**
 * 所查询值不是`null`和`undefined`则认为存在
 * @example
 * exist(undefined) // false
 * exist(null) // false
 * exist(false) // true
 * exist(false, '') // true
 * exist(false, 'a') // false
 * exist([{ a: 1, b: null }], '0.a') // true
 * exist([{ a: 1, b: null }], '0.b') // false
 * exist({ foo: { bar: { a: 'AA', b: null } } }, 'foo.bar.a') // true
 * exist({ foo: { bar: { a: 'AA', b: null } } }, 'foo.bar.b') // false
 */
export declare function exist(o: any, k?: string): boolean;

/**
 * 扩展url
 * @example
 * extendUrl('xxx.com?a=1&b=2', { query: { b: 3, c: 4 }, remove: ['a'], position: 'search' }) // 返回 xxx.com?b=3&c=4
 * extendUrl('xxx.com?a=1&b=2#/a=1', { query: { b: 3, c: 4 }, remove: ['a'], position: 'hash' }) // 返回 xxx.com?a=1&b=2#/a=1?b=3&c=4
 */
export declare function extendUrl(url: string, options?: {
    /**
     * @default search
     */
    position: 'search' | 'hash';
    query?: Record<string, string | number>;
    remove?: (string | RegExp)[];
    /**
     * @default true
     */
    encode?: boolean;
}): string;

/**
 * 根据key路径提取值
 * @example
 * exist(undefined) // undefined
 * exist(null) // null
 * exist(false) // false
 * exist(false, '') // false
 * exist(false, 'a') // undefined
 * exist([{ a: 1, b: null }], '0.a') // 1
 * exist([{ a: 1, b: null }], '0.b') // null
 * exist({ foo: { bar: { a: 'AA', b: null } } }, 'foo.bar.a') // AA
 * exist({ foo: { bar: { a: 'AA', b: null } } }, 'foo.bar.b') // null
 */
export declare function extract(o: any, k?: string): any;

/**
 * @example
 * 例如：str = '{dayZone}好，{userName}！您今天有 {toDealWithNum} 条待办事项需要处理。'
 * formatString(str, { dayZone: '早上', userName: '张三', toDealWithNum: 2 })
 * // 翻译后
 * '早上好，张三！您今天有 2 条待办事项需要处理。'
 * 对于数组可使用索引值来标识
 * 例如：str = '{0}好，{1}！您今天有 {2} 条待办事项需要处理。'
 * formatString(str, ['早上', '张三', 2])
 * // 翻译后
 * '早上好，张三！您今天有 2 条待办事项需要处理。'
 * @param inputStr
 * @param mapParams
 * @returns {string}
 */
export declare function formatString(inputStr: string, mapParams: Record<PropertyKey, any> | PropertyKey[]): string;

/**
 * 获取树深度
 * @param {object[]} tree
 * @param {SearchTreeOptions} [options]
 * @returns {number}
 */
export declare function getTreeDepth(tree: object[], options?: SearchTreeOptions): number;

/**
 * 获取树节点完整路径
 *
 * @template T
 * @param {T[]} tree - 原始数据
 * @param {string|number} nodeId - 查找的节点id
 * @param {BaseTreeOptions} [options]
 * @returns {T[]}
 */
export declare function getTreeFullPath<T extends object>(tree: T[], nodeId: string | number, options?: BaseTreeOptions): T[];

/**
 * 根据唯一树节点id查找此节点的数据
 * @param {T[]} tree - 原始数据
 * @param {string|number} nodeId - 查找的节点id
 * @param {BaseTreeOptions} [options]
 * @returns {T|undefined}
 */
export declare function getTreeNodeDataById<T extends object>(tree: T[], nodeId: string | number, options?: BaseTreeOptions): T | undefined;

/**
 * 获取数据类型
 * @param arg
 */
export declare function getType(arg: unknown): string;

/**
 * 根据URL获取参数对象
 * @example
 * getUrlQuery('xxx.com?a=1&b=2', { position: 'search' }) // 返回：{ a: 1, b: 2 }
 * getUrlQuery('xxx.com?a=1&b=2#/path/?c=3&d=4', { position: 'hash' }) // 返回：{ c: 3, d: 4 }
 */
export declare function getUrlQuery(url: string, options?: {
    /**
     * @default search
     */
    position: 'search' | 'hash';
    /**
     * @default true
     */
    decode?: boolean;
}): Record<string, string>;

declare const im_s_m: unique symbol;

/**
 * 不可变数据
 *
 * NOTE 可能会触发"类型实例化过深，且可能无限。ts(2589)"错误。使用ts目前不可能实现无限扩展字段的功能
 * @example
 * ```ts
 * const imut1 = ImmutableStore.create({ foo: '' });
 const imut2 = imut1.extend({ bar: false });
 const imut3 = imut2
 .imut('foo', 'hello')
 .imuts({ foo: 'hh', bar: true })
 .extend({ bar: [1] })
 .set('foo', 'world');

 imut3.query('foo');
 imut2.valueOf();
 imut3
 .extend({ bar: ['1'] })
 .valueOf().bar;
 * ```
 */
export declare class ImmutableStore<S extends ImmutableStoreMap = {}> {
    static create<SS extends ImmutableStoreMap = {}>(store?: SS): ImmutableStore<SS>;
    [im_s_m]: S;
    private constructor();
    extend<U extends ImmutableStoreMap>(extens: U): ImmutableStore<ShallowMerge<S, U>>;
    set<K extends keyof S>(k: K, v: S[K]): this;
    query<T extends keyof S>(k: T): S[T];
    clone(): ImmutableStore<S>;
    imut<K extends keyof S>(k: K, v: S[K]): ImmutableStore<S>;
    imuts(kv: Partial<S>): ImmutableStore<S>;
    valueOf(): {} & S;
}

declare type ImmutableStoreMap = Record<string, any>;

/**
 * 判断是否是数组
 * @param arg
 */
export declare function isArray<T>(arg: unknown): arg is Array<T>;

export declare function isBoolean(arg: unknown): arg is boolean;

/**
 * 是否是循环对象
 */
export declare function isCircular(target: any): boolean;

/**
 * 是否是复杂数据类型
 * object,array,function
 * @param arg
 */
export declare function isComplex(arg: unknown): arg is object;

export declare function isComplexButNotFunctionType(arg: unknown): arg is object;

export declare function isDate(arg: unknown): arg is Date;

/**
 * 是否是Dom元素
 * window和document也判定为dom类型，因为它们可以做添加监听事件等其它行为
 * @param arg
 */
export declare function isDom(arg: unknown): arg is Window | Document | HTMLElement;

/**
 * 是否是HTMLElement
 * @param arg
 */
export declare function isEle(arg: unknown): arg is HTMLElement;

/**
 * 无可遍历属性视为空对象
 * @param arg
 */
export declare function isEmptyObject(arg: unknown): arg is Record<PropertyKey, never>;

/**
 * 是否是浮点数
 */
export declare function isFloatNumber(arg: unknown): arg is number;

export declare function isFunction(arg: unknown): arg is (...args: any[]) => any;

/**
 * 是否是整数
 */
export declare function isInteger(arg: unknown): arg is number;

/**
 * 对象宽松的判断。 不包括null和数组，但是包括HTMLElement，Date等等其他对象
 * @param arg
 */
export declare function isLooseObject(arg: unknown): arg is Record<PropertyKey, any>;

declare function isNaN_2(arg: unknown): arg is number;
export { isNaN_2 as isNaN }

/**
 * 判断是否是null数据类型
 * @param arg
 */
export declare function isNull(arg: unknown): arg is null;

export declare function isNullOrUndefined(arg: unknown): arg is null | undefined;

export declare function isNumber(arg: unknown): arg is number;

/**
 * 是否是数字型数据。包含string类型
 * 注意诸如[1], ['1']等会隐式转为字符'1'
 * @param arg
 */
export declare function isNumeric(arg: unknown): arg is string | number;

/**
 * 是否是对象，同isLooseObject
 * 很多时候我们只是使用对象这种类型来方便存储数据而已，这里我们在喜好上采用宽松判断
 * @param arg
 */
export declare function isObject(arg: unknown): arg is Record<PropertyKey, any>;

/**
 * 是否继承自Object.prototype
 * @param arg
 * @example
 *  var a = { a: 'a' } // true
 *  var b = Object.create(null) // false
 *  function Apple() {}
 *  var apple = new Apple(); // false
 */
export declare function isPlainObject(arg: unknown): arg is Record<PropertyKey, any>;

/**
 * 是否是原始值类型
 * null,undefined,number,string,boolean,symbol
 * @param arg
 */
export declare function isPrimitive(arg: unknown): arg is null | undefined | number | string | boolean | symbol;

/**
 * 严格的对象判断
 * @param arg
 */
export declare function isStrictObject(arg: unknown): arg is Record<PropertyKey, any>;

export declare function isString(arg: unknown): arg is string;

export declare function isSymbol(arg: unknown): arg is symbol;

/**
 * 判断数据类型
 * @param input 输入数据
 * @param type 要比较的数据类型
 * @example
 * ```ts
 * isType(1, 'number') // true
 * ```
 */
export declare function isType<T extends keyof DataTypeMapping>(input: any, type: T): input is DataTypeMapping[T];

export declare function isUndefined(arg: unknown): arg is undefined;

/**
 * 判断是否是合法的时间格式类型。
 *
 * 就是是否能被 Date构造函数正确解析的参数
 *
 * 注意 `null`和`boolean` 都会被解析为1970时间
 */
export declare function isValidDateArg(arg: unknown): arg is string | Date | number;

export declare function makeGetterSetter<T>(defalutValue: T): [() => T, (newVal: T) => T];

/**
 * 是否是浮点数。包含string类型
 * 基本行为与isNumeric一致
 * @param arg
 */
export declare function maybeFloatNumber(arg: unknown): arg is string | number;

/**
 * 是否是整数。包含string类型
 */
export declare function maybeInteger(arg: unknown): arg is string | number;

/**
 * 将对象中值为`null`和`undefined`的属性移除
 * @example
 * ```ts
 * nonNullable({ a: 1, b: undefined, c: 2, d: null })
 * // output: { a: 1, c: 2 }
 * ```
 */
export declare function nonNullable<T extends object>(obj: T): {
    [K in keyof T]-?: NonNullable<T[K]>;
};

export declare function objectKeyPathValue(o: object): Array<{
    path: string[];
    value: any;
}>;

/**
 * 将一个对象指定属性排除，并生成一个新的对象
 * @param obj 目标对象
 * @param fields 要排除的属性列表
 */
export declare function omit<T extends object, K extends keyof T>(obj: T, fields: readonly K[]): Omit<T, (typeof fields)[number]>;

/**
 * 选择对象指定属性，并生成一个新的对象
 * @param obj 目标对象
 * @param fields 要选择的属性列表
 */
export declare function pick<T extends object, K extends keyof T>(obj: T, fields: readonly K[]): Pick<T, (typeof fields)[number]>;

/**
 *  安全解析对象
 */
export declare function safeParse(obj: any, fallbackValue?: {}): any;

/**
 * 搜索树所有结果
 * @template T
 * @param {T[]} tree
 * @param {(node: T) => boolean} cond 返回true表明此节点满足要求
 * @param {SearchTreeOptions} [options]
 * @param {string} [options.children=children] - 子级字段名。默认: `children`
 * @param {boolean} [options.onlyLeaf=false] - 是否只查找叶子节点数据。默认: `false`
 * @returns {T[]}
 */
export declare function searchTree<T extends object>(tree: T[], cond: (node: T) => boolean, options?: SearchTreeOptions): T[];

export declare type SearchTreeOptions = Omit<BaseTreeOptions, 'id'>;

declare type ShallowMerge<T, U> = Omit<T, keyof U> & U;

/**
 * 平铺树结构数据
 * @template T
 * @param {T[]} tree
 * @param {SearchTreeOptions} [options]
 * @returns {T[]}
 */
export declare function tree2Array<T extends object>(tree: T[], options?: SearchTreeOptions): T[];

/**
 * 遍历树
 *
 * 一般用于查找数据
 *
 * 额外用途：例如可以用来改变节点字段名
 *
 * @description
 * `visit`方法返回一个函数将会在节点退出阶段执行（此时当前节点下的所有子节点已处理完毕）
 * @template T
 * @param {T[]} tree
 * @param {(node: T, nodeInfo: WalkTreeNodeInfo, stopWalk: () => void) => any} visit 访问到节点
 * @param {SearchTreeOptions} [options]
 * @param {string} [options.children=children] - 子级字段名。默认: `children`
 * @param {boolean} [options.onlyLeaf=false] - 是否只查找叶子节点数据。默认: `false`
 * @returns {T[]}
 */
export declare function walkTree<T extends object>(tree: T[], visit: (node: T, nodeInfo: WalkTreeNodeInfo<T>, stopWalk: () => void, stopWalkChildren: () => void) => any, options?: SearchTreeOptions): any;

declare type WalkTreeNodeInfo<T> = {
    /**
     * 是否是叶子节点
     */
    isLeaf: boolean;
    /**
     * 当前节点的深度
     */
    curDepth: number;
    parent: T | null;
    /**
     * 在子节点列表中所处位置
     */
    index: number;
};

export { }
