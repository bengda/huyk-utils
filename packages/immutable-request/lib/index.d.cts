import z$1, { z } from 'zod';
import * as _huyk_utils_atom_event from '@huyk-utils/atom-event';
import { AtomEvent, AtomEventPool } from '@huyk-utils/atom-event';
import { AsyncExecutionLimiter } from '@huyk-utils/utils';

/**
 * 基于zod的接口请求实现
 *
 * NOTE 此文件更多的是一种接口请求范式约束的实现
 *
 * NOTE 请不要在此文件书写业务代码
 *
 * NOTE 可以在此文件针对业务去实现一个通用的抽象意义上的接口，但是不允许引入业务逻辑。目前我预留了一个`custom`字段
 * @author huyongkang
 * @refer https://www.npmjs.com/package/zod
 */

type AugmentedRequired<T extends object, K extends keyof T = keyof T> = Omit<T, K> & Required<Pick<T, K>>;
declare enum RequestExceptionTypeEnum {
    /**
     * 构建的API结构不符合要求
     */
    ERR_API_VALIDATION = "ERR_API_VALIDATION",
    /**
     * 发送的数据格式不正确。应该符合 Request 结构
     */
    ERR_REQUEST_DTO_VALIDATION = "ERR_REQUEST_DTO_VALIDATION",
    /**
     * 业务层面的发送数据校验失败了
     */
    ERR_REQUEST_DATA_VALIDATION = "ERR_REQUEST_DATA_VALIDATION",
    /**
     * 返回的数据格式不正确，应该符合 Reponse 结构
     */
    ERR_RESPONSE_DTO_VALIDATION = "ERR_RESPONSE_DTO_VALIDATION",
    /**
     * 业务层面的返回的数据校验失败了
     */
    ERR_RESPONSE_DATA_VALIDATION = "ERR_RESPONSE_DATA_VALIDATION",
    /**
     * 业务层面的返回的数据结构校验失败了
     */
    ERR_RESPONSE_DATA_STRUCT_VALIDATION = "ERR_RESPONSE_DATA_STRUCT_VALIDATION",
    /**
     * 使用JSON.parse对结果数据转换失败了
     */
    ERR_RESPONSE_DATA_TRANSFORM = "ERR_RESPONSE_DATA_TRANSFORM",
    /**
     * 配置参数不正确
     */
    ERR_CONFIG_VALIDATION = "ERR_CONFIG_VALIDATION",
    /**
     * 真正的发起http请求的处理函数出错了
     */
    ERR_REQUEST_EXECUTOR = "ERR_REQUEST_EXECUTOR"
}
declare class RequestException extends Error {
    data?: unknown;
    type: RequestExceptionTypeEnum;
    detail: any;
    customMessage?: string;
    constructor(message: string, payload: {
        type: RequestExceptionTypeEnum;
        data?: unknown;
        detail?: any;
        customMessage?: string;
    });
}
declare const RequestMethod: z.ZodEnum<["GET", "DELETE", "HEAD", "OPTIONS", "POST", "PUT", "PATCH", "PURGE", "LINK", "UNLINK", "TRACE", "CONNECT"]>;
type RequestMethodType = z.output<typeof RequestMethod>;
declare const RequestHeaders: z.ZodRecord<z.ZodString, z.ZodString>;
declare const RequestBody: z.ZodAny;
declare const ResponseType: z.ZodEnum<["arraybuffer", "blob", "document", "json", "text", "stream"]>;
type ResponseTypeList = z.output<typeof ResponseType>;
declare const Request: z.ZodObject<{
    url: z.ZodString;
    method: z.ZodDefault<z.ZodEnum<["GET", "DELETE", "HEAD", "OPTIONS", "POST", "PUT", "PATCH", "PURGE", "LINK", "UNLINK", "TRACE", "CONNECT"]>>;
    headers: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
    data: z.ZodDefault<z.ZodAny>;
    responseType: z.ZodDefault<z.ZodEnum<["arraybuffer", "blob", "document", "json", "text", "stream"]>>;
    /**
     * 自定义数据
     */
    custom: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    url: z.ZodString;
    method: z.ZodDefault<z.ZodEnum<["GET", "DELETE", "HEAD", "OPTIONS", "POST", "PUT", "PATCH", "PURGE", "LINK", "UNLINK", "TRACE", "CONNECT"]>>;
    headers: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
    data: z.ZodDefault<z.ZodAny>;
    responseType: z.ZodDefault<z.ZodEnum<["arraybuffer", "blob", "document", "json", "text", "stream"]>>;
    /**
     * 自定义数据
     */
    custom: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    url: z.ZodString;
    method: z.ZodDefault<z.ZodEnum<["GET", "DELETE", "HEAD", "OPTIONS", "POST", "PUT", "PATCH", "PURGE", "LINK", "UNLINK", "TRACE", "CONNECT"]>>;
    headers: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
    data: z.ZodDefault<z.ZodAny>;
    responseType: z.ZodDefault<z.ZodEnum<["arraybuffer", "blob", "document", "json", "text", "stream"]>>;
    /**
     * 自定义数据
     */
    custom: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, z.ZodTypeAny, "passthrough">>;
interface RequestInput extends z.input<typeof Request> {
}
interface RequestOutput extends z.output<typeof Request> {
}
declare const ResponseHeaders: z.ZodRecord<z.ZodString, z.ZodString>;
declare const ResponseCookies: z.ZodArray<z.ZodString, "many">;
declare const BaseResponse: z.ZodObject<{
    data: z.ZodDefault<z.ZodAny>;
    /**
     * http请求状态码
     */
    status: z.ZodNumber;
    statusText: z.ZodDefault<z.ZodString>;
    headers: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
    cookies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    status?: number;
    headers?: Record<string, string>;
    data?: any;
    statusText?: string;
    cookies?: string[];
}, {
    status?: number;
    headers?: Record<string, string>;
    data?: any;
    statusText?: string;
    cookies?: string[];
}>;
declare const Response: z.ZodObject<{
    data: z.ZodDefault<z.ZodAny>;
    /**
     * http请求状态码
     */
    status: z.ZodNumber;
    statusText: z.ZodDefault<z.ZodString>;
    headers: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
    cookies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    data: z.ZodDefault<z.ZodAny>;
    /**
     * http请求状态码
     */
    status: z.ZodNumber;
    statusText: z.ZodDefault<z.ZodString>;
    headers: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
    cookies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    data: z.ZodDefault<z.ZodAny>;
    /**
     * http请求状态码
     */
    status: z.ZodNumber;
    statusText: z.ZodDefault<z.ZodString>;
    headers: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
    cookies: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, z.ZodTypeAny, "passthrough">>;
interface ResponseInput<T> extends z.input<typeof BaseResponse> {
    data?: T;
}
interface ResponseOutput<T> extends z.output<typeof BaseResponse> {
    data?: T;
}
type AugmentedResponseOutput<T> = AugmentedRequired<ResponseOutput<T>, 'data'>;
declare const RequestApiSchema: z.ZodObject<{
    /**
     * 基路径
     */
    baseUrl: z.ZodDefault<z.ZodString>;
    url: z.ZodString;
    method: z.ZodDefault<z.ZodEnum<["GET", "DELETE", "HEAD", "OPTIONS", "POST", "PUT", "PATCH", "PURGE", "LINK", "UNLINK", "TRACE", "CONNECT"]>>;
    responseType: z.ZodDefault<z.ZodEnum<["arraybuffer", "blob", "document", "json", "text", "stream"]>>;
    headers: z.ZodOptional<z.ZodFunction<z.ZodTuple<[z.ZodAny], z.ZodUnknown>, z.ZodUnion<[z.ZodPromise<z.ZodRecord<z.ZodString, z.ZodString>>, z.ZodRecord<z.ZodString, z.ZodString>]>>>;
    /**
     * 请求数据模型
     */
    data: z.ZodOptional<z.ZodUnknown>;
    /**
     * 服务器返回的业务数据模型
     */
    response: z.ZodOptional<z.ZodUnknown>;
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
    responseStruct: z.ZodOptional<z.ZodUnknown>;
    /**
     * 自定义数据
     */
    custom: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    url?: string;
    method?: "GET" | "DELETE" | "HEAD" | "OPTIONS" | "POST" | "PUT" | "PATCH" | "PURGE" | "LINK" | "UNLINK" | "TRACE" | "CONNECT";
    headers?: (args_0: any, ...args_1: unknown[]) => Record<string, string> | Promise<Record<string, string>>;
    data?: unknown;
    responseType?: "arraybuffer" | "blob" | "document" | "json" | "text" | "stream";
    custom?: Record<string, any>;
    baseUrl?: string;
    response?: unknown;
    responseStruct?: unknown;
}, {
    url?: string;
    method?: "GET" | "DELETE" | "HEAD" | "OPTIONS" | "POST" | "PUT" | "PATCH" | "PURGE" | "LINK" | "UNLINK" | "TRACE" | "CONNECT";
    headers?: (args_0: any, ...args_1: unknown[]) => Record<string, string> | Promise<Record<string, string>>;
    data?: unknown;
    responseType?: "arraybuffer" | "blob" | "document" | "json" | "text" | "stream";
    custom?: Record<string, any>;
    baseUrl?: string;
    response?: unknown;
    responseStruct?: unknown;
}>;
interface RequestApiSchemaInput extends z.input<typeof RequestApiSchema> {
}
interface RequestApiSchemaOutput extends z.output<typeof RequestApiSchema> {
}
interface CRequestApi<D> extends Omit<z.input<typeof RequestApiSchema>, 'response'> {
    data?: z.ZodType<any, any, D>;
}
interface RequestApi<D, R> extends Pick<z.output<typeof RequestApiSchema>, 'response'>, CRequestApi<D> {
    response?: z.ZodType<R, any, any>;
}
/**
 * 仅仅是为了类型定义
 */
declare function defineRequestApi<D, R>(input: RequestApi<D, R>): RequestApi<D, R>;
declare const RequestOptions: z.ZodObject<{
    /**
     * @default false
     */
    loading: z.ZodDefault<z.ZodBoolean>;
    loadingText: z.ZodDefault<z.ZodString>;
    /**
     * 很多情况下，请求非常快速，可能会出现loading动画一闪而过
     *
     * 这里设置延时出现加载动画，需要开发自行处理逻辑，这里只是中转参数设置，只是提供一种设计范式
     *
     * @default 200
     */
    loadingDelay: z.ZodDefault<z.ZodNumber>;
    /**
     * 超时时间（毫秒）
     * @default 20000
     */
    timeout: z.ZodDefault<z.ZodNumber>;
    headers: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
    /**
     * 对于类似`user/:userId/info` 路径处理
     *
     * @default (:[a-zA-Z_]\\w*)
     */
    pathParamsPattern: z.ZodDefault<z.ZodString>;
    /**
     * 自定义数据
     */
    custom: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "passthrough", z.ZodTypeAny, z.objectOutputType<{
    /**
     * @default false
     */
    loading: z.ZodDefault<z.ZodBoolean>;
    loadingText: z.ZodDefault<z.ZodString>;
    /**
     * 很多情况下，请求非常快速，可能会出现loading动画一闪而过
     *
     * 这里设置延时出现加载动画，需要开发自行处理逻辑，这里只是中转参数设置，只是提供一种设计范式
     *
     * @default 200
     */
    loadingDelay: z.ZodDefault<z.ZodNumber>;
    /**
     * 超时时间（毫秒）
     * @default 20000
     */
    timeout: z.ZodDefault<z.ZodNumber>;
    headers: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
    /**
     * 对于类似`user/:userId/info` 路径处理
     *
     * @default (:[a-zA-Z_]\\w*)
     */
    pathParamsPattern: z.ZodDefault<z.ZodString>;
    /**
     * 自定义数据
     */
    custom: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, z.ZodTypeAny, "passthrough">, z.objectInputType<{
    /**
     * @default false
     */
    loading: z.ZodDefault<z.ZodBoolean>;
    loadingText: z.ZodDefault<z.ZodString>;
    /**
     * 很多情况下，请求非常快速，可能会出现loading动画一闪而过
     *
     * 这里设置延时出现加载动画，需要开发自行处理逻辑，这里只是中转参数设置，只是提供一种设计范式
     *
     * @default 200
     */
    loadingDelay: z.ZodDefault<z.ZodNumber>;
    /**
     * 超时时间（毫秒）
     * @default 20000
     */
    timeout: z.ZodDefault<z.ZodNumber>;
    headers: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
    /**
     * 对于类似`user/:userId/info` 路径处理
     *
     * @default (:[a-zA-Z_]\\w*)
     */
    pathParamsPattern: z.ZodDefault<z.ZodString>;
    /**
     * 自定义数据
     */
    custom: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, z.ZodTypeAny, "passthrough">>;
interface RequestOptionsInput extends z.input<typeof RequestOptions> {
}
interface RequestOptionsOutput extends z.output<typeof RequestOptions> {
}
type Fetcher = (request: RequestOutput, api: RequestApiSchemaOutput, requestOpts: RequestOptionsOutput) => Promise<ResponseInput<unknown>>;
declare function request<D, R>(fetcher: Fetcher, apiInput: RequestApi<D, R>, data: D, opts?: RequestOptionsInput): Promise<ResponseOutput<R>>;

declare const kv_m$1: unique symbol;
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
declare class ImmutableRequestApiDef<B, M, RT, H, D, R, C, RS> {
    static create<B = undefined, M = undefined, RT = undefined, H = undefined, D = undefined, R = undefined, C = undefined, RS = undefined>(store?: Partial<RequestApiStruct<B, M, RT, H, D, R, C, RS>> & {
        url: string;
    }): ImmutableRequestApiDef<B, M, RT, H, D, R, C, RS>;
    [kv_m$1]: RequestApiStruct<B, M, RT, H, D, R, C, RS>;
    private constructor();
    query<K extends keyof RequestApiStruct<B, M, RT, H, D, R, C, RS>>(k: K): RequestApiStruct<B, M, RT, H, D, R, C, RS>[K];
    clone(): ImmutableRequestApiDef<B, M, RT, H, D, R, C, RS>;
    valueOf(): RequestApiStruct<B, M, RT, H, D, R, C, RS>;
    baseUrl<T extends RequestApi<any, any>['baseUrl']>(baseUrl: T): ImmutableRequestApiDef<T, M, RT, H, D, R, C, RS>;
    url(url: string): ImmutableRequestApiDef<B, M, RT, H, D, R, C, RS>;
    method<T extends RequestApi<any, any>['method']>(method: T): ImmutableRequestApiDef<B, T, RT, H, D, R, C, RS>;
    responseType<T extends RequestApi<any, any>['responseType']>(responseType: T): ImmutableRequestApiDef<B, M, T, H, D, R, C, RS>;
    headers<T extends RequestApi<any, any>['headers']>(headers: T): ImmutableRequestApiDef<B, M, RT, T, D, R, C, RS>;
    custom<W extends boolean, T extends (RequestApi<any, any>['custom'] | C)>(custom: T, overwrite?: W): ImmutableRequestApiDef<B, M, RT, H, D, R, `${W}` extends "true" ? T : T extends undefined ? C : Omit<C, keyof T> & T, RS>;
    data<T extends z$1.ZodType<any, any, any> | undefined>(data: T): ImmutableRequestApiDef<B, M, RT, H, T, R, C, RS>;
    response<T extends z$1.ZodType<any, any, any> | undefined>(response: T): ImmutableRequestApiDef<B, M, RT, H, D, T, C, RS>;
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
    responseStruct<T extends z$1.ZodType<any, any, any> | undefined>(responseStruct: T): ImmutableRequestApiDef<B, M, RT, H, D, R, C, T>;
}

declare const kv_m: unique symbol;
declare const lmt: unique symbol;
declare const ef: unique symbol;
declare const icts: unique symbol;
type RequestObserverRequestStatus = 'prepare' | 'pending' | 'resolved' | 'rejected';
type RequestApiDefType = ImmutableRequestApiDef<RequestApi<any, any>['baseUrl'], RequestApi<any, any>['method'], RequestApi<any, any>['responseType'], Exclude<RequestApi<any, any>['headers'], undefined> | undefined, any, any, RequestApi<any, any>['custom'], any>;
interface RequestObserverKV<D, R, C, DE, O, F, RP> {
    apiDef: C extends undefined ? undefined : RequestApi<D, R>;
    defaultResponseData: DE;
    options: O;
    fetcher: F;
    limit: number;
    race: boolean;
    responseParser: RP;
}
type ImmutableRequestObserverEffector<D, R> = AtomEvent<{
    apiDef: RequestApi<D, R>;
    reqId: string;
    status: RequestObserverRequestStatus;
    parse(): any;
}>;
type ImmutableRequestObserverInterceptorParam<D, R, C> = {
    reqId: string;
    apiDef: NonNullable<C extends undefined ? undefined : RequestApi<D, R>>;
    data: D;
    options: RequestOptionsInput | undefined;
    detail: any;
};
type ImmutableRequestObserverInterceptor<D, R, C> = AtomEventPool<Record<RequestObserverRequestStatus, ImmutableRequestObserverInterceptorParam<D, R, C>>>;
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
declare class ImmutableRequestObserver<D, R, C, DE, O, F, RP> {
    /**
     * @public
     */
    static create<D, R, C, DE, O, F, RP>(kv?: Partial<RequestObserverKV<D, R, C, DE, O, F, RP>>, effector?: ImmutableRequestObserverEffector<D, R>, interceptor?: ImmutableRequestObserverInterceptor<D, R, C>): ImmutableRequestObserver<D, R, C, DE, O, F, RP>;
    /**
     * @public
     */
    static cloneEffector(source: ImmutableRequestObserver<any, any, any, any, any, any, any>, target: ImmutableRequestObserver<any, any, any, any, any, any, any>, disableInheritListeners?: boolean): void;
    /**
     * @public
     */
    static cloneInterceptor(source: ImmutableRequestObserver<any, any, any, any, any, any, any>, target: ImmutableRequestObserver<any, any, any, any, any, any, any>, disableInheritListeners?: boolean): void;
    [kv_m]: RequestObserverKV<D, R, C, DE, O, F, RP>;
    [lmt]: AsyncExecutionLimiter;
    [ef]: ImmutableRequestObserverEffector<D, R>;
    [icts]: ImmutableRequestObserverInterceptor<D, R, C>;
    private constructor();
    /**
     * 监听请求操作，并进行相关数据修改
     * @public
     */
    intercept(...args: Parameters<ImmutableRequestObserverInterceptor<D, R, C>['on']>): _huyk_utils_atom_event.AtomEventCanceler;
    /**
     * 派生出一个新的实例
     * @param disableInheritListeners - 是否不继承已有的监听函数
     * @public
     */
    derive<D, R, C, DE, O, F, RP>(kv: RequestObserverKV<D, R, C, DE, O, F, RP>, disableInheritListeners?: boolean): ImmutableRequestObserver<D, R, C, DE, O, F, RP>;
    /**
     * 复制为一个新的实例
     * @param disableInheritListeners - 是否不继承已有的监听函数
     * @public
     */
    clone(disableInheritListeners?: boolean): ImmutableRequestObserver<D, R, C, DE, O, F, RP>;
    /**
     * 更新数据
     * @public
     */
    update<K extends keyof RequestObserverKV<D, R, C, DE, O, F, RP>>(k: K, v: RequestObserverKV<D, R, C, DE, O, F, RP>[K]): this;
    /**
     * @public
     */
    query<K extends keyof RequestObserverKV<D, R, C, DE, O, F, RP>>(key: K): RequestObserverKV<D, R, C, DE, O, F, RP>[K];
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
    send(data: D, opts?: RequestOptionsInput): Promise<(RP extends ((...args: any) => any) ? ReturnType<RP> : AugmentedResponseOutput<R>)>;
    /**
     * 设置默认返回值
     *
     *  NOTE 会派生出一个新的实例。
     * @public
     */
    defaultResponseData<T extends (R extends undefined ? any : R) | undefined>(value: T): ImmutableRequestObserver<D, R, C, T, O, F, RP>;
    /**
     * 限制并发数
     *
     * NOTE 会派生出一个新的实例。只更改当前实例数据请使用`update`方法
     * @public
     */
    limit(limit: number): ImmutableRequestObserver<D, R, C, DE, O, F, RP>;
    /**
     * 设置是否是竞态执行
     *
     * NOTE 会派生出一个新的实例。只更改当前实例数据请使用`update`方法
     * @public
     */
    race(race: boolean): ImmutableRequestObserver<D, R, C, DE, O, F, RP>;
    /**
     * 请求行为的其他配置
     *
     * NOTE 会派生出一个新的实例。只更改当前实例数据请使用`update`方法
     * @public
     */
    options<T extends RequestOptionsInput | undefined, W extends boolean>(options: T, overwrite?: W): ImmutableRequestObserver<D, R, C, DE, `${W}` extends "true" ? T : T extends undefined ? O : Omit<O, keyof T> & T, F, RP>;
    /**
     * 设置真正发起请求的执行器
     *
     *  NOTE 会派生出一个新的实例。
     * @public
     */
    fetcher<T extends Fetcher | undefined>(fetcher: T): ImmutableRequestObserver<D, R, C, DE, O, T, RP>;
    /**
     * 设置对返回的数据进行解析的函数
     *
     * NOTE 会派生出一个新的实例。只更改当前实例数据请使用`update`方法
     *
     * NOTE 建议只在最后的使用前进行定义
     * @public
     */
    responseParser<T extends ((response: AugmentedResponseOutput<R>) => any) | undefined>(responseParser: T): ImmutableRequestObserver<D, R, C, DE, O, F, T>;
    /**
     * 观察每个请求阶段的状态和数据
     * @public
     */
    observe(effect: (params: {
        apiDef: RequestApi<D, R>;
        reqId: string;
        status: RequestObserverRequestStatus;
        parse<S extends RequestObserverRequestStatus>(status: S): S extends 'prepare' ? {
            data: D;
            options: RequestOptionsInput;
            reqId: string;
        } : (S extends 'pending' ? {
            reqId: string;
            data: D;
            options: RequestOptionsInput;
        } : (S extends 'resolved' ? {
            afterParse: (RP extends ((...args: any) => any) ? ReturnType<RP> : AugmentedResponseOutput<R>);
            response: AugmentedResponseOutput<R>;
            options: RequestOptionsInput;
        } : ({
            error: any;
            options: RequestOptionsInput;
        })));
    }) => any): _huyk_utils_atom_event.AtomEventCanceler;
    /**
     * 消费接口定义
     *
     * NOTE 会派生出一个新的实例
     *
     * NOTE 会重置`responseParser`
     * @public
     */
    consume<T extends RequestApiDefType | (() => RequestApiDefType)>(immutableApiDef: T): ImmutableRequestObserver<ReturnType<(T extends (...args: any) => any ? ReturnType<T> : T)["valueOf"]>["data"] extends undefined ? undefined : z$1.input<Exclude<ReturnType<(T extends (...args: any) => any ? ReturnType<T> : T)["valueOf"]>["data"], undefined>>, ReturnType<(T extends (...args: any) => any ? ReturnType<T> : T)["valueOf"]>["response"] extends undefined ? ReturnType<(T extends (...args: any) => any ? ReturnType<T> : T)["valueOf"]>["responseStruct"] extends undefined ? undefined : z$1.output<Exclude<ReturnType<(T extends (...args: any) => any ? ReturnType<T> : T)["valueOf"]>["responseStruct"], undefined>> : z$1.output<Exclude<ReturnType<(T extends (...args: any) => any ? ReturnType<T> : T)["valueOf"]>["response"], undefined>>, ReturnType<(T extends (...args: any) => any ? ReturnType<T> : T)["valueOf"]>, DE, O, F, undefined>;
    /**
     * @public
     */
    clearEffects(): void;
    /**
     * @public
     */
    clearInterceptors(): boolean;
}

export { type AugmentedResponseOutput, BaseResponse, type Fetcher, ImmutableRequestApiDef, ImmutableRequestObserver, type ImmutableRequestObserverEffector, type ImmutableRequestObserverInterceptor, type ImmutableRequestObserverInterceptorParam, Request, type RequestApi, type RequestApiDefType, RequestApiSchema, type RequestApiSchemaInput, type RequestApiSchemaOutput, RequestBody, RequestException, RequestExceptionTypeEnum, RequestHeaders, type RequestInput, RequestMethod, type RequestMethodType, type RequestObserverKV, type RequestObserverRequestStatus, RequestOptions, type RequestOptionsInput, type RequestOptionsOutput, type RequestOutput, Response, ResponseCookies, ResponseHeaders, type ResponseInput, type ResponseOutput, ResponseType, type ResponseTypeList, defineRequestApi, request };
