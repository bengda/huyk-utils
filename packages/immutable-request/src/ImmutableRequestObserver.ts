// written by huyongkang

import type z from 'zod';
import { omit, cloneData, AsyncExecutionLimiter } from '@huyk-utils/utils';
import { AtomEvent, AtomEventPool } from '@huyk-utils/atom-event';
import {
  request,
  type RequestApi,
  type Fetcher,
  type RequestOptionsInput,
  type AugmentedResponseOutput,
} from './request-lib';
import type ImmutableRequestApiDef from './ImmutableRequestApiDef';

const kv_m = Symbol();
const lmt = Symbol();
const ef = Symbol();
const icts = Symbol();
const NoFetcher: Fetcher = () => {
  throw new Error('You should implement a fetcher to handle this request.');
};

export type RequestObserverRequestStatus = 'prepare' | 'pending' | 'resolved' | 'rejected';

function responseParser<D, R, C, DE, O, F, RP>(
  observer: ImmutableRequestObserver<D, R, C, DE, O, F, RP>,
  response: AugmentedResponseOutput<R>,
  options: RequestOptionsInput,
): () => ({
    afterParse: (RP extends ((...args: any) => any) ? ReturnType<RP> : AugmentedResponseOutput<R>);
    response: AugmentedResponseOutput<R>;
    options: RequestOptionsInput;
  }) {
  const parser = observer.query('responseParser');

  if (response.data === undefined || response.data === null) {
    Reflect.set(response, 'data', observer.query('defaultResponseData'));
  }

  if (typeof parser === 'function') {
    return () => ({
      afterParse: parser(response),
      response: response,
      options,
    });
  }

  return () => ({
    response: response as any,
    afterParse: response as any,
    options,
  });
}

function fetcher<D, R, C, DE, O, F, RP>(observer: ImmutableRequestObserver<D, R, C, DE, O, F, RP>, param: ImmutableRequestObserverInterceptorParam<D, R, C>) {
  return async (...args: any[]) => {
    await notifyInterceptors(observer, 'pending', param);
    emitEffects(observer, 'pending', param, () => ({ reqId: param.reqId, options: param.options, data: param.data }));

    // @ts-ignore
    return (observer[kv_m].fetcher || NoFetcher)(...args);
  };
}

async function notifyInterceptors<D, R, C, DE, O, F, RP>(
  observer: ImmutableRequestObserver<D, R, C, DE, O, F, RP>,
  status: RequestObserverRequestStatus,
  params: ImmutableRequestObserverInterceptorParam<D, R, C>,
) {
  await observer[icts].emit(status, params, { abortWhenErrorOccured: true, onlyThrowFirstError: true });
}

function emitEffects<D, R, C, DE, O, F, RP>(
  observer: ImmutableRequestObserver<D, R, C, DE, O, F, RP>,
  status: RequestObserverRequestStatus,
  params: ImmutableRequestObserverInterceptorParam<D, R, C>,
  parse: () => any,
) {
  observer[ef].emit({
    reqId: params.reqId,
    status,
    apiDef: params.apiDef,
    parse,
  });
}

async function send<D, R, C, DE, O, F, RP>(observer: ImmutableRequestObserver<D, R, C, DE, O, F, RP>, data: D, opts?: RequestOptionsInput): Promise<AugmentedResponseOutput<R>> {
  const apiDef = observer.query('apiDef');
  if (!apiDef) {
    throw new Error('no config to execute.');
  }

  const reqId = Math.random().toString(16).split('.')[1].substring(0, 6);

  const interceptorParam: ImmutableRequestObserverInterceptorParam<D, R, C> = {
    reqId,
    apiDef: apiDef,
    data,
    options: opts,
    detail: undefined as any,
  };

  try {
    const _opts = opts || {};
    if (_opts.custom) {
      _opts.custom.reqId = reqId;
    } else {
      _opts.custom = { reqId };
    }

    Object.assign(interceptorParam, { options: _opts });

    await notifyInterceptors(observer, 'prepare', interceptorParam);
    emitEffects(observer, 'prepare', interceptorParam, () => omit(interceptorParam, ['apiDef']));
    const f = await fetcher(observer, interceptorParam);
    const ret = (await request(f, interceptorParam.apiDef, interceptorParam.data, interceptorParam.options));
    interceptorParam.detail = ret;
    await notifyInterceptors(observer, 'resolved', interceptorParam);
    emitEffects(observer, 'resolved', interceptorParam, responseParser(observer, interceptorParam.detail, interceptorParam.options as RequestOptionsInput));
    return ret as AugmentedResponseOutput<R>;
  } catch (error) {
    interceptorParam.detail = error;
    await notifyInterceptors(observer, 'rejected', interceptorParam).catch((err) => {
      interceptorParam.detail = err;
    });
    emitEffects(observer, 'rejected', interceptorParam, () => ({
      error: interceptorParam.detail,
      options: interceptorParam.options,
    }));

    throw interceptorParam.detail;
  }
}

export type RequestApiDefType = ImmutableRequestApiDef<
  RequestApi<any, any>['baseUrl'],
  RequestApi<any, any>['method'],
  RequestApi<any, any>['responseType'],
  Exclude<RequestApi<any, any>['headers'], undefined> | undefined,
  any,
  any,
  RequestApi<any, any>['custom'],
  any
>;

export interface RequestObserverKV<D, R, C, DE, O, F, RP> {
  apiDef: C extends undefined ? undefined : RequestApi<D, R>;
  defaultResponseData: DE;
  options: O;
  fetcher: F;
  limit: number;
  race: boolean;
  responseParser: RP;
}

export type ImmutableRequestObserverEffector<D, R> = AtomEvent<{
  apiDef: RequestApi<D, R>;
  reqId: string;
  status: RequestObserverRequestStatus;
  parse(): any;
}>;

export type ImmutableRequestObserverInterceptorParam<D, R, C> = {
  reqId: string;
  apiDef: NonNullable<C extends undefined ? undefined : RequestApi<D, R>>;
  data: D;
  options: RequestOptionsInput | undefined;
  detail: any;
};

export type ImmutableRequestObserverInterceptor<D, R, C> = AtomEventPool<Record<RequestObserverRequestStatus, ImmutableRequestObserverInterceptorParam<D, R, C>>>;

/**
 * 接口请求观察类
 * @example
 * ```ts
 * const observer = ImmutableRequestObserver.create();
const apiDef = ImmutableRequestApiDef.create()
  .baseUrl('')
  .url(('api/v1/list'))
  .method('GET')
  .response(z.object({ hello: z.string() }))
  .responseType('json');

apiDef.query('response');

const ob1 = observer.consume(apiDef);

ob1
  .defaultResponseData({ hello: '' })
  .responseParser((res) => {});
 * ```
 */
export default class ImmutableRequestObserver<
  D,
  R,
  C,
  DE,
  O,
  F,
  RP,
> {
  /**
   * @public
   */
  static create<D, R, C, DE, O, F, RP>(
    kv?: Partial<RequestObserverKV<D, R, C, DE, O, F, RP>>,
    effector?: ImmutableRequestObserverEffector<D, R>,
    interceptor?: ImmutableRequestObserverInterceptor<D, R, C>,
  ) {
    const n = new ImmutableRequestObserver<D, R, C, DE, O, F, RP>();

    const kvm = Object.assign({}, { limit: 1, race: true }, cloneData(kv));

    Reflect.set(n, kv_m, kvm);
    Reflect.set(n, lmt, new AsyncExecutionLimiter({ race: kvm.race, limit: kvm.limit }));
    Reflect.set(n, ef, effector || new AtomEvent());
    Reflect.set(n, icts, interceptor || new AtomEventPool(['prepare', 'pending', 'resolved', 'rejected']));

    return n;
  }

  /**
   * @public
   */
  static cloneEffector(
    source: ImmutableRequestObserver<any, any, any, any, any, any, any>,
    target: ImmutableRequestObserver<any, any, any, any, any, any, any>,
    disableInheritListeners?: boolean,
  ) {
    target[ef] = disableInheritListeners ? new AtomEvent() : source[ef].clone();
  }

  /**
   * @public
   */
  static cloneInterceptor(
    source: ImmutableRequestObserver<any, any, any, any, any, any, any>,
    target: ImmutableRequestObserver<any, any, any, any, any, any, any>,
    disableInheritListeners?: boolean,
  ) {
    target[icts] = source[icts].clone(disableInheritListeners);
  }

  declare [kv_m]: RequestObserverKV<D, R, C, DE, O, F, RP>;

  declare [lmt]: AsyncExecutionLimiter;

  declare [ef]: ImmutableRequestObserverEffector<D, R>;

  declare [icts]: ImmutableRequestObserverInterceptor<D, R, C>;

  private constructor() {}

  /**
   * 监听请求操作，并进行相关数据修改
   * @public
   */
  intercept(...args: Parameters<ImmutableRequestObserverInterceptor<D, R, C>['on']>) {
    return this[icts].on(...args);
  }

  /**
   * 派生出一个新的实例
   * @param disableInheritListeners - 是否不继承已有的监听函数
   * @public
   */
  derive<D, R, C, DE, O, F, RP>(kv: RequestObserverKV<D, R, C, DE, O, F, RP>, disableInheritListeners?: boolean) {
    const cloned = ImmutableRequestObserver.create<D, R, C, DE, O, F, RP>(kv);

    ImmutableRequestObserver.cloneEffector(this, cloned, disableInheritListeners);

    ImmutableRequestObserver.cloneInterceptor(this, cloned, disableInheritListeners);

    return cloned;
  }

  /**
   * 复制为一个新的实例
   * @param disableInheritListeners - 是否不继承已有的监听函数
   * @public
   */
  clone(disableInheritListeners?: boolean) {
    return this.derive<D, R, C, DE, O, F, RP>(this[kv_m], disableInheritListeners);
  }

  /**
   * 更新数据
   * @public
   */
  update<K extends keyof RequestObserverKV<D, R, C, DE, O, F, RP>>(k: K, v: RequestObserverKV<D, R, C, DE, O, F, RP>[K]) {
    Reflect.set(this[kv_m], k, v);

    if (['limit', 'race'].includes(k)) {
      Reflect.set(this[lmt], k, v);
    }

    return this;
  }

  /**
   * @public
   */
  query<K extends keyof RequestObserverKV<D, R, C, DE, O, F, RP>>(key: K) {
    return this[kv_m][key];
  }

  /**
   * 发送数据
   * @public
   * @example
   * ```ts
   * const res = await observer.send({});
   *
   * //
   * ```
   */
  async send(data: D, opts?: RequestOptionsInput): Promise<(RP extends ((...args: any) => any) ? ReturnType<RP> : AugmentedResponseOutput<R>)> {
    const options = Object.assign({}, this.query('options'), opts);
    const request = () => send(this, data, options);

    const ret = await this[lmt].run(request);

    return responseParser(this, ret, options)().afterParse;
  }

  /**
   * 设置默认返回值
   *
   *  NOTE 会派生出一个新的实例。
   * @public
   */
  defaultResponseData<T extends (R extends undefined ? any : R) | undefined>(value: T) {
    return this.derive<D, R, C, T, O, F, RP>(Object.assign({}, this[kv_m], { defaultResponseData: value }));
  }

  /**
   * 限制并发数
   *
   * NOTE 会派生出一个新的实例。只更改当前实例数据请使用`update`方法
   * @public
   */
  limit(limit: number) {
    return this.derive<D, R, C, DE, O, F, RP>(Object.assign({}, this[kv_m], { limit }));
  }

  /**
   * 设置是否是竞态执行
   *
   * NOTE 会派生出一个新的实例。只更改当前实例数据请使用`update`方法
   * @public
   */
  race(race: boolean) {
    return this.derive<D, R, C, DE, O, F, RP>(Object.assign({}, this[kv_m], { race }));
  }

  /**
   * 请求行为的其他配置
   *
   * NOTE 会派生出一个新的实例。只更改当前实例数据请使用`update`方法
   * @public
   */
  options<T extends RequestOptionsInput | undefined, W extends boolean>(options: T, overwrite?: W) {
    return this.derive<
      D,
      R,
      C,
      DE,
      `${W}` extends 'true'
        ? T
        : T extends undefined
          ? O
          : Omit<O, keyof T> & T,
      F,
      RP
    >(Object.assign({}, this[kv_m], { options: overwrite ? options : Object.assign({}, this.query('options'), options) as any }));
  }

  /**
   * 设置真正发起请求的执行器
   *
   *  NOTE 会派生出一个新的实例。
   * @public
   */
  fetcher<T extends Fetcher | undefined>(fetcher: T) {
    return this.derive<D, R, C, DE, O, T, RP>(Object.assign({}, this[kv_m], { fetcher }));
  }

  /**
   * 设置对返回的数据进行解析的函数
   *
   * NOTE 会派生出一个新的实例。只更改当前实例数据请使用`update`方法
   *
   * NOTE 建议只在最后的使用前进行定义
   * @public
   */
  responseParser<T extends ((response: AugmentedResponseOutput<R>) => any) | undefined>(responseParser: T) {
    return this.derive<D, R, C, DE, O, F, T>(Object.assign({}, this[kv_m], { responseParser }));
  }

  /**
   * 观察每个请求阶段的状态和数据
   * @public
   */
  observe(effect: (params: {
    apiDef: RequestApi<D, R>;
    reqId: string;
    status: RequestObserverRequestStatus;
    parse<S extends RequestObserverRequestStatus>(status: S): S extends 'prepare'
      ? { data: D; options: RequestOptionsInput; reqId: string }
      : (S extends 'pending'
          ? { reqId: string; data: D; options: RequestOptionsInput }
          : (S extends 'resolved'
              ? {
                  afterParse: (RP extends ((...args: any) => any) ? ReturnType<RP> : AugmentedResponseOutput<R>);
                  response: AugmentedResponseOutput<R>;
                  options: RequestOptionsInput;
                }
              : ({ error: any; options: RequestOptionsInput })
            )
        );
  }) => any) {
    return this[ef].on(effect);
  }

  /**
   * 消费接口定义
   *
   * NOTE 会派生出一个新的实例
   *
   * NOTE 会重置`responseParser`
   * @public
   */
  consume<T extends RequestApiDefType | (() => RequestApiDefType)>(immutableApiDef: T) {
    type Extracted = T extends (...args: any) => any ? ReturnType<T> : T;
    type DefaultResponseStruct = ReturnType<Extracted['valueOf']>['responseStruct'] extends undefined ? undefined : z.output<Exclude<ReturnType<Extracted['valueOf']>['responseStruct'], undefined>>;

    const def = typeof immutableApiDef === 'function' ? immutableApiDef() : immutableApiDef;

    return this.derive<
      ReturnType<Extracted['valueOf']>['data'] extends undefined ? undefined : z.input<Exclude<ReturnType<Extracted['valueOf']>['data'], undefined>>,
      ReturnType<Extracted['valueOf']>['response'] extends undefined ? DefaultResponseStruct : z.output<Exclude<ReturnType<Extracted['valueOf']>['response'], undefined>>,
      ReturnType<Extracted['valueOf']>,
      DE,
      O,
      F,
      undefined
    >(Object.assign({}, this[kv_m], { apiDef: def.valueOf(), responseParser: undefined }) as any);
  }

  /**
   * @public
   */
  clearEffects() {
    return this[ef].clear();
  }

  /**
   * @public
   */
  clearInterceptors() {
    return this[icts].clearAll();
  }
}

// const observer = ImmutableRequestObserver.create();
// const apiDef = ImmutableRequestApiDef.create()
//   .baseUrl('')
//   .url(('api/v1/list'))
//   .method('GET')
//   .response(z.object({ hello: z.string() }))
//   .responseType('json');

// apiDef.query('response');

// const ob1 = observer.consume(apiDef);

// ob1
//   .defaultResponseData({ hello: '' })
//   .responseParser((res) => { return res.data; })
//   .send(undefined).then((res) => {
//     console.info(res);
//   });
