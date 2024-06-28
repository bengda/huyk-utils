// written by huyongkang

/**
 * 获取数据类型
 * @param arg
 */
export function getType(arg: unknown): string {
  return Object.prototype.toString.call(arg).slice(8, -1).toLowerCase();
}

export interface DataTypeMapping {
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
 * 判断数据类型
 * @param input 输入数据
 * @param type 要比较的数据类型
 * @example
 * ```ts
 * isType(1, 'number') // true
 * ```
 */
export function isType<T extends keyof DataTypeMapping>(input: any, type: T): input is DataTypeMapping[T] {
  return getType(input) === type;
}

/**
 * 判断是否是数组
 * @param arg
 */
export function isArray<T>(arg: unknown): arg is Array<T> {
  return getType(arg) === 'array';
}

/**
 * 判断是否是null数据类型
 * @param arg
 */
export function isNull(arg: unknown): arg is null {
  return getType(arg) === 'null';
}

/**
 * 对象宽松的判断。 不包括null和数组，但是包括HTMLElement，Date等等其他对象
 * @param arg
 */
export function isLooseObject(arg: unknown): arg is Record<PropertyKey, any> {
  return typeof arg === 'object' && !isNull(arg) && !isArray(arg);
}

/**
 * 是否是对象，同isLooseObject
 * 很多时候我们只是使用对象这种类型来方便存储数据而已，这里我们在喜好上采用宽松判断
 * @param arg
 */
export function isObject(arg: unknown): arg is Record<PropertyKey, any> {
  // return Object.prototype.toString.call(arg) === '[object Object]';
  return isLooseObject(arg);
}

/**
 * 严格的对象判断
 * @param arg
 */
export function isStrictObject(arg: unknown): arg is Record<PropertyKey, any> {
  return getType(arg) === 'object';
}

export function isString(arg: unknown): arg is string {
  return getType(arg) === 'string';
}

export function isNumber(arg: unknown): arg is number {
  return getType(arg) === 'number';
}

export function isBoolean(arg: unknown): arg is boolean {
  return getType(arg) === 'boolean';
}

export function isFunction(arg: unknown): arg is (...args: any[]) => any {
  return getType(arg) === 'function';
}

export function isDate(arg: unknown): arg is Date {
  return getType(arg) === 'date';
}

export function isNaN(arg: unknown): arg is number {
  // eslint-disable-next-line no-self-compare
  return isNumber(arg) && arg !== arg;
}

export function isUndefined(arg: unknown): arg is undefined {
  return getType(arg) === 'undefined';
}

export function isNullOrUndefined(arg: unknown): arg is null | undefined {
  return isNull(arg) || isUndefined(arg);
}

export function isSymbol(arg: unknown): arg is symbol {
  return getType(arg) === 'symbol';
}

/**
 * 是否是原始值类型
 * null,undefined,number,string,boolean,symbol
 * @param arg
 */
export function isPrimitive(arg: unknown): arg is null | undefined | number | string | boolean | symbol {
  return isNullOrUndefined(arg) || isNumber(arg) || isString(arg) || isBoolean(arg) || isSymbol(arg);
}

/**
 * 是否是复杂数据类型
 * object,array,function
 * @param arg
 */
export function isComplex(arg: unknown): arg is object {
  return isLooseObject(arg) || isArray(arg) || isFunction(arg);
}

export function isComplexButNotFunctionType(arg: unknown): arg is object {
  return isComplex(arg) && !isFunction(arg);
}

/**
 * 是否是Dom元素
 * window和document也判定为dom类型，因为它们可以做添加监听事件等其它行为
 * @param arg
 */
export function isDom(arg: unknown): arg is Window | Document | HTMLElement {
  return arg === window || arg === document || arg instanceof HTMLElement;
}

/**
 * 是否是HTMLElement
 * @param arg
 */
export function isEle(arg: unknown): arg is HTMLElement {
  return arg instanceof HTMLElement;
}

/**
 * 是否继承自Object.prototype
 * @param arg
 * @example
 *  var a = { a: 'a' } // true
 *  var b = Object.create(null) // false
 *  function Apple() {}
 *  var apple = new Apple(); // false
 */
export function isPlainObject(arg: unknown): arg is Record<PropertyKey, any> {
  return isObject(arg) && Object.getPrototypeOf(arg) === Object.prototype;
}

/**
 * 无可遍历属性视为空对象
 * @param arg
 */
export function isEmptyObject(arg: unknown): arg is Record<PropertyKey, never> {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return isObject(arg) && !Object.keys(arg as object).length;
}

/**
 * 是否是数字型数据。包含string类型
 * 注意诸如[1], ['1']等会隐式转为字符'1'
 * @param arg
 */
export function isNumeric(arg: unknown): arg is string | number {
  return !isArray(arg) && /^[+-]?[0-9]\d*$|^[+-]?[0-9]\d*\.\d+$/g.test(arg as string);
}

/**
 * 是否是整数。包含string类型
 */
export function maybeInteger(arg: unknown): arg is string | number {
  return isNumeric(arg) && Math.floor(arg as number) === Number(arg);
}

/**
 * 是否是整数
 */
export function isInteger(arg: unknown): arg is number {
  return isNumber(arg) && maybeInteger(arg);
}
/**
 * 是否是浮点数。包含string类型
 * 基本行为与isNumeric一致
 * @param arg
 */
export function maybeFloatNumber(arg: unknown): arg is string | number {
  return isNumeric(arg) && /^[+-]?[0-9]\d*\.\d+$/g.test(arg as string);
}

/**
 * 是否是浮点数
 */
export function isFloatNumber(arg: unknown): arg is number {
  return isNumber(arg) && maybeFloatNumber(arg);
}

/**
 * 判断是否是合法的时间格式类型。
 *
 * 就是是否能被 Date构造函数正确解析的参数
 *
 * 注意 `null`和`boolean` 都会被解析为1970时间
 */
export function isValidDateArg(arg: unknown): arg is string | Date | number {
  if (isString(arg) || isDate(arg) || isNumber(arg)) {
    return new Date(arg as string).toString() !== 'Invalid Date';
  }

  return false;
}

