// written by huyongkang
import { getType, isPlainObject } from './types';

/**
 * get query name-value strings
 */
const QUERY_REG = /(?:\?(.+))/;
/**
 * split url to hashUrl and queryUrl
 * NOTE 目前对于foo.com/?a=a&b=/#/view这种形式的地址，忽略 # 两边的 /，这个判定定义为 HASH_SPLIT_REG
 * 更加合法的写法应该是 foo.com?a=a&b=#/view，左边的 / 是不允许存在的
 */
const HASH_SPLIT_REG = /\/?#\/?/;

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
export function decodeURI2Str(uri: string): string {
  try {
    const parsed = decodeURIComponent(uri);

    if (parsed === uri) {
      return uri;
    }

    return decodeURI2Str(parsed);
  } catch (error) {
    // 有可能字符串里有`%`等字符了
    return uri;
  }
}

/**
 * 根据URL获取参数对象
 * @example
 * getUrlQuery('xxx.com?a=1&b=2', { position: 'search' }) // 返回：{ a: 1, b: 2 }
 * getUrlQuery('xxx.com?a=1&b=2#/path/?c=3&d=4', { position: 'hash' }) // 返回：{ c: 3, d: 4 }
 */
export function getUrlQuery(url: string, options?: {
  /**
   * @default search
   */
  position: 'search' | 'hash';
  /**
   * @default true
   */
  decode?: boolean;
}): Record<string, string> {
  const { position = 'query', decode = true } = options || {};
  const urlSplits = url.split(HASH_SPLIT_REG);

  if (position === 'hash') {
    return getUrlQuery(urlSplits[1] || '', { position: 'search', decode });
  }

  const theRequest: Record<string, string> = {};

  const urlPath = urlSplits[0] || '';
  const queryStrRes = QUERY_REG.exec(urlPath);
  const queryStrings = queryStrRes ? queryStrRes[1] : '';
  const strs = queryStrings ? queryStrings.split('&') : [];

  strs.forEach((unitStr) => {
    const { 1: name, 2: value } = /^([^=]+)=(.*)$/.exec(unitStr) || [];
    if (name) {
      theRequest[name] = decode ? decodeURI2Str(value) : value;
    }
  });

  return theRequest;
}

/**
 * 扩展url
 * @example
 * extendUrl('xxx.com?a=1&b=2', { query: { b: 3, c: 4 }, remove: ['a'], position: 'search' }) // 返回 xxx.com?b=3&c=4
 * extendUrl('xxx.com?a=1&b=2#/a=1', { query: { b: 3, c: 4 }, remove: ['a'], position: 'hash' }) // 返回 xxx.com?a=1&b=2#/a=1?b=3&c=4
 */
export function extendUrl(
  url: string,
  options?: {
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
  },
): string {
  const { query = {}, remove = [], encode = true, position = 'search' } = options || {};
  const urlRawQuery = getUrlQuery(url, { position, decode: encode });
  const querys: string[] = [];

  const { 0: queryUrl = '', 1: hashUrl = '' } = url.split(HASH_SPLIT_REG);

  const hashMatchRes = url.match(HASH_SPLIT_REG);
  const hashSplitChar = hashMatchRes ? hashMatchRes[0] : '';

  const queryRes = QUERY_REG.exec(queryUrl);

  const queryMark = `@query${Date.now()}@`;

  let queryStr = queryRes ? queryRes[1] : '';

  let $queryUrl = queryUrl;

  if (queryStr) {
    $queryUrl = $queryUrl.replace(queryStr, queryMark);
  }

  Object.assign(urlRawQuery, query);

  Object.keys(urlRawQuery).forEach((key) => {
    const flag = remove.some((item) => {
      if (Object.prototype.toString.call(item) === '[object RegExp]') {
        return (item as unknown as RegExp).test(key);
      }
      return item === key;
    });
    if (!flag) {
      querys.push(`${key}=${encode ? encodeURIComponent(urlRawQuery[key]) : urlRawQuery[key]}`);
    }
  });

  const path = querys.join('&');

  switch (position) {
    case 'search': {
      queryStr = path;
      if ($queryUrl.indexOf(queryMark) < 0) {
        $queryUrl = queryUrl + queryMark;
      }
      if (path && !/\?$/.test($queryUrl.split(queryMark)[0])) {
        queryStr = `?${queryStr}`;
      }
      return $queryUrl.replace(queryMark, queryStr) + hashSplitChar + hashUrl;
    }
    case 'hash': {
      const hashUrlResult = extendUrl(hashUrl, {
        query,
        remove,
        position: 'search',
        encode,
      });
      return queryUrl + (hashUrlResult ? hashSplitChar || '#' : hashSplitChar) + hashUrlResult;
    }
    default:
      break;
  }

  return url;
}

/**
 *  安全解析对象
 */
export function safeParse(obj: any, fallbackValue = {}) {
  try {
    return JSON.parse(obj);
  } catch {
    return fallbackValue;
  }
}

/**
 * 将一个对象指定属性排除，并生成一个新的对象
 * @param obj 目标对象
 * @param fields 要排除的属性列表
 */
export function omit<T extends object, K extends keyof T>(obj: T, fields: readonly K[]) {
  const ret = {};

  Object.entries(obj).forEach(([p, v]) => {
    if (!fields.includes(p as K)) {
      Reflect.set(ret, p, v);
    }
  });

  return ret as Omit<T, typeof fields[number]>;
}

/**
 * 将对象中值为`null`和`undefined`的属性移除
 * @example
 * ```ts
 * nonNullable({ a: 1, b: undefined, c: 2, d: null })
 * // output: { a: 1, c: 2 }
 * ```
 */
export function nonNullable<T extends object>(obj: T): {
  [K in keyof T]-?: NonNullable<T[K]>
} {
  return Object.entries(obj).reduce((hoist, [k, v]) => {
    if (v !== null && v !== undefined) {
      Reflect.set(hoist, k, v);
    }

    return hoist;
  }, {} as ({ [K in keyof T]-?: NonNullable<T[K]> }));
}

/**
 * 选择对象指定属性，并生成一个新的对象
 * @param obj 目标对象
 * @param fields 要选择的属性列表
 */
export function pick<T extends object, K extends keyof T>(obj: T, fields: readonly K[]) {
  const ret = {};

  Object.entries(obj).forEach(([p, v]) => {
    if (fields.includes(p as K)) {
      Reflect.set(ret, p, v);
    }
  });

  return ret as Pick<T, typeof fields[number]>;
}

/**
 * 延时取值
 * @example
 * ```ts
 * delayResolve(1).after(1000);
 * ```
 */
export function delayResolve<T>(data: T) {
  let tid: number;
  let res: any;
  let rej: any;

  const p = new Promise<T>((resolve, reject) => {
    res = resolve;
    rej = reject;
  });

  const after = (delay: number) => {
    // @ts-ignore
    tid = setTimeout(() => res?.(data), delay);

    return p;
  };

  const cancel = () => {
    clearTimeout(tid);
    rej?.(new Error('delay task canceled.'));
  };

  return {
    after,
    cancel,
  };
}

/**
 * 创建自动循环执行函数
 */
export function createAsyncLooper<T>(params: {
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
}) {
  const { handler, timeout = 3000, delay = 500 } = params;

  const asyncRunner = () => new Promise((resolve, reject) => {
    let finished = false;
    let err = new Error(`execution time over ${timeout} ms`);
    let delayer = delayResolve(0);

    const tid = setTimeout(() => {
      finished = true;
      reject(err);
    }, timeout);

    const abort = () => {
      delayer.cancel();
      finished = true;
      reject({ aborted: true });
    };

    const run = async () => {
      try {
        const res = await handler(abort);

        clearTimeout(tid);
        finished = true;
        delayer.cancel();
        resolve(res);
      } catch (error: any) {
        err = error;

        if (!finished) {
          delayer = delayResolve(0);
          delayer.after(delay).then(() => {
            if (!finished) {
              run();
            }
          });
        }
      }
    };

    run();
  }) as Promise<T>;

  return asyncRunner;
}

export function makeGetterSetter<T>(defalutValue: T): [() => T, (newVal: T) => T] {
  let val: T = defalutValue;

  const getVal = () => val;

  const setVal = (newVal: T | ((oldVal: T) => T)) => {
    // @ts-ignore
    val = typeof newVal === 'function' ? newVal(val) : newVal;
    return val;
  };

  return [getVal, setVal];
}

/**
 * 比较两个版本号
 *
 * - 如果 a < b 返回 - 1
 * - 如果 a > b 返回 1
 * - 如果 a 和 b 相等返回 0
 */
export function compareSemanticVersion(a: string, b: string): 0 | -1 | 1 {
  const pa = Object.assign(['0', '0', '0'], a.split('.'));
  const pb = Object.assign(['0', '0', '0'], b.split('.'));
  for (let i = 0; i < 3; i += 1) {
    const na = Number(pa[i]);
    const nb = Number(pb[i]);
    if (na > nb) return 1;
    if (nb > na) return -1;
    if (!Number.isNaN(na) && Number.isNaN(nb)) return 1;
    if (Number.isNaN(na) && !Number.isNaN(nb)) return -1;
  }
  return 0;
}

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
export function formatString(inputStr: string, mapParams: Record<PropertyKey, any> | PropertyKey[]) {
  let text = inputStr;

  Object.keys(mapParams).forEach((prop: PropertyKey) => {
    text = text.replace(new RegExp(`\\{\\s*${prop as string}\\s*\\}`, 'g'), (mapParams as any)[prop]);
  });

  return text;
}

/**
 * 是否是循环对象
 */
export function isCircular(target: any): boolean {
  const walk = (obj: any, stack: object[]) => {
    const isObjectType = ['array', 'object'].includes(getType(obj));

    if (isObjectType) {
      if (stack.includes(obj)) {
        return true;
      }

      stack.push(obj);

      const flag = Object.values(obj).some(v => walk(v, stack));

      stack.pop();

      return flag;
    }

    return false;
  };

  return walk(target, []);
}

/**
 * 简单的数据克隆
 *
 * 如果目标是循环对象会抛出错误
 */
export function cloneData<T>(target: T): T {
  if (isCircular(target)) {
    throw new Error('has circular structure.');
  }

  const copy = (data: any) => {
    const isArray = getType(data) === 'array';
    const isObject = getType(data) === 'object';
    const isArrayOrObject = isArray || isObject;

    if (isArrayOrObject) {
      const hoist = isArray ? [] : {};

      for (const [k, v] of Object.entries(data as object)) {
        // @ts-ignore
        hoist[k] = cloneData(v);
      }

      return hoist as T;
    }

    return data;
  };

  return copy(target);
}

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
export function exist(o: any, k?: string): boolean {
  if (!k) {
    return null !== o && undefined !== o;
  }

  try {
    const keys = k.split('.');
    const sub = o[keys.at(0)!];

    return exist(sub, keys.slice(1).join('.'));
  } catch (error) {
    return false;
  }
}

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
export function extract(o: any, k?: string) {
  if (!k) {
    return o;
  }

  try {
    const keys = k.split('.');
    const sub = o[keys.at(0)!];

    return extract(sub, keys.slice(1).join('.'));
  } catch (error) {
    return undefined;
  }
}

export function objectKeyPathValue(o: object): Array<{ path: string[]; value: any }> {
  const ret: Array<{ path: string[]; value: any }> = [];

  const walk = (obj: any, keyPath: string[]) => {
    ret.push({ path: keyPath.concat(), value: obj });

    if (isPlainObject(obj)) {
      Object.entries(obj).forEach(([k, v]) => {
        keyPath.push(k);
        walk(v, keyPath);
        keyPath.pop();
      });
    }
  };

  walk(o, []);

  return ret;
}
