import { cloneData, AsyncExecutionLimiter, omit } from '@huyk-utils/utils';
import { AtomEvent, AtomEventPool } from '@huyk-utils/atom-event';
import { z } from 'zod';

const kv_m$1 = Symbol();
class ImmutableRequestApiDef {
  static create(store) {
    const n = new ImmutableRequestApiDef();
    Reflect.set(n, kv_m$1, Object.assign({}, cloneData(store) || { url: "" }));
    return n;
  }
  constructor() {
  }
  query(k) {
    return this[kv_m$1][k];
  }
  clone() {
    return ImmutableRequestApiDef.create(this[kv_m$1]);
  }
  valueOf() {
    return Object.assign({}, this[kv_m$1]);
  }
  // SECTION
  baseUrl(baseUrl) {
    return ImmutableRequestApiDef.create({ ...this[kv_m$1], baseUrl });
  }
  url(url) {
    return ImmutableRequestApiDef.create({ ...this[kv_m$1], url });
  }
  method(method) {
    return ImmutableRequestApiDef.create({ ...this[kv_m$1], method });
  }
  responseType(responseType) {
    return ImmutableRequestApiDef.create({ ...this[kv_m$1], responseType });
  }
  headers(headers) {
    return ImmutableRequestApiDef.create({ ...this[kv_m$1], headers });
  }
  custom(custom, overwrite) {
    return ImmutableRequestApiDef.create({ ...this[kv_m$1], custom: overwrite ? custom : Object.assign({}, this.query("custom"), custom) });
  }
  data(data) {
    return ImmutableRequestApiDef.create({ ...this[kv_m$1], data });
  }
  response(response) {
    return ImmutableRequestApiDef.create({ ...this[kv_m$1], response });
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
  responseStruct(responseStruct) {
    return ImmutableRequestApiDef.create({ ...this[kv_m$1], responseStruct });
  }
  // !SECTION
}

var RequestExceptionTypeEnum = /* @__PURE__ */ ((RequestExceptionTypeEnum2) => {
  RequestExceptionTypeEnum2["ERR_API_VALIDATION"] = "ERR_API_VALIDATION";
  RequestExceptionTypeEnum2["ERR_REQUEST_DTO_VALIDATION"] = "ERR_REQUEST_DTO_VALIDATION";
  RequestExceptionTypeEnum2["ERR_REQUEST_DATA_VALIDATION"] = "ERR_REQUEST_DATA_VALIDATION";
  RequestExceptionTypeEnum2["ERR_RESPONSE_DTO_VALIDATION"] = "ERR_RESPONSE_DTO_VALIDATION";
  RequestExceptionTypeEnum2["ERR_RESPONSE_DATA_VALIDATION"] = "ERR_RESPONSE_DATA_VALIDATION";
  RequestExceptionTypeEnum2["ERR_RESPONSE_DATA_STRUCT_VALIDATION"] = "ERR_RESPONSE_DATA_STRUCT_VALIDATION";
  RequestExceptionTypeEnum2["ERR_RESPONSE_DATA_TRANSFORM"] = "ERR_RESPONSE_DATA_TRANSFORM";
  RequestExceptionTypeEnum2["ERR_CONFIG_VALIDATION"] = "ERR_CONFIG_VALIDATION";
  RequestExceptionTypeEnum2["ERR_REQUEST_EXECUTOR"] = "ERR_REQUEST_EXECUTOR";
  return RequestExceptionTypeEnum2;
})(RequestExceptionTypeEnum || {});
class RequestException extends Error {
  constructor(message, payload) {
    super(message);
    this.name = "RequestException";
    this.type = payload.type;
    this.data = payload.data;
    this.detail = payload.detail;
    this.customMessage = payload.customMessage;
  }
}
const RequestMethod = z.enum([
  // 'get',
  "GET",
  // 'delete',
  "DELETE",
  // 'head',
  "HEAD",
  // 'options',
  "OPTIONS",
  // 'post',
  "POST",
  // 'put',
  "PUT",
  // 'patch',
  "PATCH",
  // 'purge',
  "PURGE",
  // 'link',
  "LINK",
  // 'unlink',
  "UNLINK",
  // 'trace',
  "TRACE",
  // 'connect',
  "CONNECT"
]);
const RequestHeaders = z.record(z.string().min(1), z.string());
const RequestBody = z.any();
const ResponseType = z.enum([
  "arraybuffer",
  "blob",
  "document",
  /**
   * 如果返回结果是字符串会尝试使用`JSON.parse`
   */
  "json",
  "text",
  "stream"
]);
const Request = z.object({
  url: z.string().min(1),
  method: RequestMethod.default("GET"),
  headers: RequestHeaders.default({}),
  data: RequestBody.default({}),
  responseType: ResponseType.default("json"),
  /**
   * 自定义数据
   */
  custom: z.record(z.string(), z.any()).default({})
}).passthrough();
const ResponseHeaders = z.record(z.string().min(1), z.string());
const ResponseCookies = z.array(z.string());
const BaseResponse = z.object({
  data: z.any().default(null),
  /**
   * http请求状态码
   */
  status: z.number().int(),
  statusText: z.string().default(""),
  headers: ResponseHeaders.default({}),
  cookies: ResponseCookies.default([])
});
const Response = BaseResponse.passthrough();
const RequestApiSchema = z.object({
  /**
   * 基路径
   */
  baseUrl: z.string().default(""),
  url: z.string().min(1),
  method: RequestMethod.default("GET"),
  responseType: ResponseType.default("json"),
  headers: z.optional(z.function().args(
    z.any()
  ).returns(z.promise(RequestHeaders).or(RequestHeaders))),
  /**
   * 请求数据模型
   */
  data: z.unknown().optional(),
  /**
   * 服务器返回的业务数据模型
   */
  response: z.unknown().optional(),
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
  responseStruct: z.unknown().optional(),
  /**
   * 自定义数据
   */
  custom: z.record(z.string(), z.any()).default({})
});
function defineRequestApi(input) {
  return input;
}
const PathParamsPattern = "(:[a-zA-Z_]\\w*)";
const RequestOptions = z.object({
  /**
   * @default false
   */
  loading: z.boolean().default(false),
  loadingText: z.string().default(""),
  /**
   * 很多情况下，请求非常快速，可能会出现loading动画一闪而过
   *
   * 这里设置延时出现加载动画，需要开发自行处理逻辑，这里只是中转参数设置，只是提供一种设计范式
   *
   * @default 200
   */
  loadingDelay: z.number().int().default(200),
  /**
   * 超时时间（毫秒）
   * @default 20000
   */
  timeout: z.number().default(2e4),
  headers: RequestHeaders.default({}),
  /**
   * 对于类似`user/:userId/info` 路径处理
   *
   * @default (:[a-zA-Z_]\\w*)
   */
  pathParamsPattern: z.string().default(PathParamsPattern),
  /**
   * 自定义数据
   */
  custom: z.record(z.string(), z.any()).default({})
}).passthrough();
function findPathParams(url, match = PathParamsPattern) {
  const reg = new RegExp(match, "g");
  const matchRes = url.match(reg);
  if (matchRes) {
    return matchRes;
  }
  return [];
}
function transformUrl(url, params, match) {
  let transformedUrl = url;
  const matchRes = findPathParams(url, match);
  matchRes.forEach((param) => {
    const [key] = /\w+/.exec(param) || [];
    if (key) {
      transformedUrl = transformedUrl.replace(param, String(Reflect.get(params, key)));
    }
  });
  return transformedUrl;
}
function getUrl(baseUrl, path) {
  if (/^https?:\/\//.test(path)) {
    return path;
  }
  return baseUrl + path;
}
async function request(fetcher, apiInput, data, opts) {
  let api;
  try {
    api = RequestApiSchema.parse(apiInput);
  } catch (error) {
    throw new RequestException(
      "Validate API setup failed.",
      {
        type: "ERR_API_VALIDATION" /* ERR_API_VALIDATION */,
        detail: error,
        data: apiInput
      }
    );
  }
  let options;
  try {
    options = RequestOptions.parse(opts || {});
  } catch (error) {
    throw new RequestException(
      "Validate config setup failed.",
      {
        type: "ERR_CONFIG_VALIDATION" /* ERR_CONFIG_VALIDATION */,
        detail: error,
        data: opts
      }
    );
  }
  const { baseUrl, url, method, headers, responseType } = api;
  let _headers;
  try {
    const h = await headers?.(api) || {};
    _headers = RequestHeaders.parse(h);
  } catch (error) {
    throw new RequestException(
      "Validate API::headers setup failed.",
      {
        type: "ERR_API_VALIDATION" /* ERR_API_VALIDATION */,
        detail: error,
        data: api
      }
    );
  }
  let _data = data || {};
  if (api.data) {
    try {
      _data = api.data.parse(data);
    } catch (error) {
      throw new RequestException(
        "Validate request-data failed.",
        {
          type: "ERR_REQUEST_DATA_VALIDATION" /* ERR_REQUEST_DATA_VALIDATION */,
          detail: error,
          data: _data
        }
      );
    }
  }
  let request2;
  try {
    request2 = Request.parse({
      url: transformUrl(getUrl(baseUrl, url), _data, options.pathParamsPattern),
      method,
      headers: { ..._headers, ...options.headers },
      responseType,
      data: _data,
      custom: api.custom
    });
  } catch (error) {
    throw new RequestException(
      "Validate request struct failed.",
      {
        type: "ERR_REQUEST_DTO_VALIDATION" /* ERR_REQUEST_DTO_VALIDATION */,
        detail: error,
        data: api
      }
    );
  }
  let res;
  try {
    res = await fetcher(request2, api, options);
  } catch (error) {
    throw new RequestException(
      "requestExecutor error occurrence.",
      {
        type: "ERR_REQUEST_EXECUTOR" /* ERR_REQUEST_EXECUTOR */,
        detail: error,
        data: api
      }
    );
  }
  let response;
  try {
    response = Response.parse(res);
  } catch (error) {
    throw new RequestException(
      "Validate response struct failed.",
      {
        type: "ERR_RESPONSE_DTO_VALIDATION" /* ERR_RESPONSE_DTO_VALIDATION */,
        detail: error,
        data: res
      }
    );
  }
  try {
    if (request2.responseType === "json") {
      if (typeof response.data === "string") {
        response.data = JSON.parse(response.data);
      }
    }
  } catch (error) {
    throw new RequestException(
      "Transform response-data to JSON object failed.",
      {
        type: "ERR_RESPONSE_DATA_TRANSFORM" /* ERR_RESPONSE_DATA_TRANSFORM */,
        detail: error,
        data: response
      }
    );
  }
  try {
    if (api.responseStruct) {
      api.responseStruct.parse(response.data);
    }
  } catch (error) {
    throw new RequestException(
      "Validate response-data-struct failed.",
      {
        type: "ERR_RESPONSE_DATA_STRUCT_VALIDATION" /* ERR_RESPONSE_DATA_STRUCT_VALIDATION */,
        detail: error,
        data: response
      }
    );
  }
  try {
    if (api.response) {
      response.data = api.response.parse(response.data);
    }
  } catch (error) {
    throw new RequestException(
      "Validate response-data failed.",
      {
        type: "ERR_RESPONSE_DATA_VALIDATION" /* ERR_RESPONSE_DATA_VALIDATION */,
        detail: error,
        data: response
      }
    );
  }
  return response;
}

const kv_m = Symbol();
const lmt = Symbol();
const ef = Symbol();
const icts = Symbol();
const NoFetcher = () => {
  throw new Error("You should implement a fetcher to handle this request.");
};
function responseParser(observer, response, options) {
  const parser = observer.query("responseParser");
  if (response.data === void 0 || response.data === null) {
    Reflect.set(response, "data", observer.query("defaultResponseData"));
  }
  if (typeof parser === "function") {
    return () => ({
      afterParse: parser(response),
      response,
      options
    });
  }
  return () => ({
    response,
    afterParse: response,
    options
  });
}
function fetcher(observer, param) {
  return async (...args) => {
    await notifyInterceptors(observer, "pending", param);
    emitEffects(observer, "pending", param, () => ({ reqId: param.reqId, options: param.options, data: param.data }));
    return (observer[kv_m].fetcher || NoFetcher)(...args);
  };
}
async function notifyInterceptors(observer, status, params) {
  await observer[icts].emit(status, params, { abortWhenErrorOccured: true, onlyThrowFirstError: true });
}
function emitEffects(observer, status, params, parse) {
  observer[ef].emit({
    reqId: params.reqId,
    status,
    apiDef: params.apiDef,
    parse
  });
}
async function send(observer, data, opts) {
  const apiDef = observer.query("apiDef");
  if (!apiDef) {
    throw new Error("no config to execute.");
  }
  const reqId = Math.random().toString(16).split(".")[1].substring(0, 6);
  const interceptorParam = {
    reqId,
    apiDef,
    data,
    options: opts,
    detail: void 0
  };
  try {
    const _opts = opts || {};
    if (_opts.custom) {
      _opts.custom.reqId = reqId;
    } else {
      _opts.custom = { reqId };
    }
    Object.assign(interceptorParam, { options: _opts });
    await notifyInterceptors(observer, "prepare", interceptorParam);
    emitEffects(observer, "prepare", interceptorParam, () => omit(interceptorParam, ["apiDef"]));
    const f = await fetcher(observer, interceptorParam);
    const ret = await request(f, interceptorParam.apiDef, interceptorParam.data, interceptorParam.options);
    interceptorParam.detail = ret;
    await notifyInterceptors(observer, "resolved", interceptorParam);
    emitEffects(observer, "resolved", interceptorParam, responseParser(observer, interceptorParam.detail, interceptorParam.options));
    return ret;
  } catch (error) {
    interceptorParam.detail = error;
    await notifyInterceptors(observer, "rejected", interceptorParam).catch((err) => {
      interceptorParam.detail = err;
    });
    emitEffects(observer, "rejected", interceptorParam, () => ({
      error: interceptorParam.detail,
      options: interceptorParam.options
    }));
    throw interceptorParam.detail;
  }
}
class ImmutableRequestObserver {
  /**
   * @public
   */
  static create(kv, effector, interceptor) {
    const n = new ImmutableRequestObserver();
    const kvm = Object.assign({}, { limit: 1, race: true }, cloneData(kv));
    Reflect.set(n, kv_m, kvm);
    Reflect.set(n, lmt, new AsyncExecutionLimiter({ race: kvm.race, limit: kvm.limit }));
    Reflect.set(n, ef, effector || new AtomEvent());
    Reflect.set(n, icts, interceptor || new AtomEventPool(["prepare", "pending", "resolved", "rejected"]));
    return n;
  }
  /**
   * @public
   */
  static cloneEffector(source, target, disableInheritListeners) {
    target[ef] = disableInheritListeners ? new AtomEvent() : source[ef].clone();
  }
  /**
   * @public
   */
  static cloneInterceptor(source, target, disableInheritListeners) {
    target[icts] = source[icts].clone(disableInheritListeners);
  }
  constructor() {
  }
  /**
   * 监听请求操作，并进行相关数据修改
   * @public
   */
  intercept(...args) {
    return this[icts].on(...args);
  }
  /**
   * 派生出一个新的实例
   * @param disableInheritListeners - 是否不继承已有的监听函数
   * @public
   */
  derive(kv, disableInheritListeners) {
    const cloned = ImmutableRequestObserver.create(kv);
    ImmutableRequestObserver.cloneEffector(this, cloned, disableInheritListeners);
    ImmutableRequestObserver.cloneInterceptor(this, cloned, disableInheritListeners);
    return cloned;
  }
  /**
   * 复制为一个新的实例
   * @param disableInheritListeners - 是否不继承已有的监听函数
   * @public
   */
  clone(disableInheritListeners) {
    return this.derive(this[kv_m], disableInheritListeners);
  }
  /**
   * 更新数据
   * @public
   */
  update(k, v) {
    Reflect.set(this[kv_m], k, v);
    if (["limit", "race"].includes(k)) {
      Reflect.set(this[lmt], k, v);
    }
    return this;
  }
  /**
   * @public
   */
  query(key) {
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
  async send(data, opts) {
    const options = Object.assign({}, this.query("options"), opts);
    const request2 = () => send(this, data, options);
    const ret = await this[lmt].run(request2);
    return responseParser(this, ret, options)().afterParse;
  }
  /**
   * 设置默认返回值
   *
   *  NOTE 会派生出一个新的实例。
   * @public
   */
  defaultResponseData(value) {
    return this.derive(Object.assign({}, this[kv_m], { defaultResponseData: value }));
  }
  /**
   * 限制并发数
   *
   * NOTE 会派生出一个新的实例。只更改当前实例数据请使用`update`方法
   * @public
   */
  limit(limit) {
    return this.derive(Object.assign({}, this[kv_m], { limit }));
  }
  /**
   * 设置是否是竞态执行
   *
   * NOTE 会派生出一个新的实例。只更改当前实例数据请使用`update`方法
   * @public
   */
  race(race) {
    return this.derive(Object.assign({}, this[kv_m], { race }));
  }
  /**
   * 请求行为的其他配置
   *
   * NOTE 会派生出一个新的实例。只更改当前实例数据请使用`update`方法
   * @public
   */
  options(options, overwrite) {
    return this.derive(Object.assign({}, this[kv_m], { options: overwrite ? options : Object.assign({}, this.query("options"), options) }));
  }
  /**
   * 设置真正发起请求的执行器
   *
   *  NOTE 会派生出一个新的实例。
   * @public
   */
  fetcher(fetcher2) {
    return this.derive(Object.assign({}, this[kv_m], { fetcher: fetcher2 }));
  }
  /**
   * 设置对返回的数据进行解析的函数
   *
   * NOTE 会派生出一个新的实例。只更改当前实例数据请使用`update`方法
   *
   * NOTE 建议只在最后的使用前进行定义
   * @public
   */
  responseParser(responseParser2) {
    return this.derive(Object.assign({}, this[kv_m], { responseParser: responseParser2 }));
  }
  /**
   * 观察每个请求阶段的状态和数据
   * @public
   */
  observe(effect) {
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
  consume(immutableApiDef) {
    const def = typeof immutableApiDef === "function" ? immutableApiDef() : immutableApiDef;
    return this.derive(Object.assign({}, this[kv_m], { apiDef: def.valueOf(), responseParser: void 0 }));
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

export { BaseResponse, ImmutableRequestApiDef, ImmutableRequestObserver, Request, RequestApiSchema, RequestBody, RequestException, RequestExceptionTypeEnum, RequestHeaders, RequestMethod, RequestOptions, Response, ResponseCookies, ResponseHeaders, ResponseType, defineRequestApi, request };
