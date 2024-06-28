import type z from 'zod';
import type { RequestApi } from './request-lib';
import { cloneData } from '@huyk-utils/utils';

const kv_m = Symbol();

interface RequestApiStruct<B, M, RT, H, D, R, C, RS> {
  baseUrl: B;
  url: string;
  method: M;
  responseType: RT;
  headers: H;
  data: D;
  response: R;
  custom: C;
  /**
   * 仅仅只是对返回数据结构进行校验
   */
  responseStruct: RS;
}

/**
 * 不可变的api接口定义类
 * @author huyongkang
 */
export default class ImmutableRequestApiDef<B, M, RT, H, D, R, C, RS> {
  static create<
  B = undefined,
  M = undefined,
  RT = undefined,
  H = undefined,
  D = undefined,
  R = undefined,
  C = undefined,
  RS = undefined,
>(store?: Partial<RequestApiStruct<B, M, RT, H, D, R, C, RS>> & { url: string }) {
    const n = new ImmutableRequestApiDef<B, M, RT, H, D, R, C, RS>();

    Reflect.set(n, kv_m, Object.assign({}, cloneData(store) || { url: '' }));

    return n;
  }

  declare [kv_m]: RequestApiStruct<B, M, RT, H, D, R, C, RS>;

  private constructor() {}

  query<K extends keyof RequestApiStruct<B, M, RT, H, D, R, C, RS>>(k: K) {
    return this[kv_m][k];
  }

  clone() {
    return ImmutableRequestApiDef.create(this[kv_m]);
  }

  valueOf() {
    return Object.assign({}, this[kv_m]);
  }

  // SECTION
  baseUrl<T extends RequestApi<any, any>['baseUrl']>(baseUrl: T) {
    return ImmutableRequestApiDef.create<T, M, RT, H, D, R, C, RS>({ ...this[kv_m], baseUrl });
  }

  url(url: string) {
    return ImmutableRequestApiDef.create<B, M, RT, H, D, R, C, RS>({ ...this[kv_m], url });
  }

  method<T extends RequestApi<any, any>['method']>(method: T) {
    return ImmutableRequestApiDef.create<B, T, RT, H, D, R, C, RS>({ ...this[kv_m], method });
  }

  responseType<T extends RequestApi<any, any>['responseType']>(responseType: T) {
    return ImmutableRequestApiDef.create<B, M, T, H, D, R, C, RS>({ ...this[kv_m], responseType });
  }

  headers<T extends RequestApi<any, any>['headers']>(headers: T) {
    return ImmutableRequestApiDef.create<B, M, RT, T, D, R, C, RS>({ ...this[kv_m], headers });
  }

  custom<W extends boolean, T extends (RequestApi<any, any>['custom'] | C)>(custom: T, overwrite?: W) {
    return ImmutableRequestApiDef.create<
      B,
      M,
      RT,
      H,
      D,
      R,
      `${W}` extends 'true'
        ? T
        : T extends undefined
          ? C
          : Omit<C, keyof T> & T,
      RS
    >({ ...this[kv_m], custom: overwrite ? custom : Object.assign({}, this.query('custom'), custom) as any });
  }

  data<T extends z.ZodType<any, any, any> | undefined>(data: T) {
    return ImmutableRequestApiDef.create<B, M, RT, H, T, R, C, RS>({ ...this[kv_m], data });
  }

  response<
    T extends z.ZodType<any, any, any> | undefined,
  >(response: T) {
    return ImmutableRequestApiDef.create<B, M, RT, H, D, T, C, RS>({ ...this[kv_m], response });
  }

  /**
   * 仅仅只是对返回数据结构进行校验
   *
   * @example
   * 常用的结构可能如下
   * ```
   * {
   *   code: number;
   *   msg: string;
   *   data: unknown;
   * }
   * ```
   */
  responseStruct<T extends z.ZodType<any, any, any> | undefined>(responseStruct: T) {
    return ImmutableRequestApiDef.create<B, M, RT, H, D, R, C, T>({ ...this[kv_m], responseStruct });
  }
  // !SECTION
}

// const apiDef = ImmutableRequestApiDef.create({ url: '', custom: {} });
// const a = apiDef
//   .baseUrl('/api/')
//   .baseUrl(undefined)
//   .baseUrl('dd')
//   .baseUrl('aa')
//   .data(z.object({ foo: z.string() }))
//   .data(z.any())
//   .data(undefined)
//   .method('GET')
//   .custom({ foo: 1 })
//   .custom({ foo: '' })
//   .custom({ bar: false })
//   .responseType('json')
//   .response(z.number().array())
//   .headers(() => ({ 'Content-Type': 'application/json' }))
//   .custom(undefined)
//   .query('response');
//   type A = z.output<typeof a>;
