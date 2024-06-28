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
import { z } from 'zod';

type AugmentedRequired<
  T extends object,
  K extends keyof T = keyof T,
> = Omit<T, K> & Required<Pick<T, K>>;

export enum RequestExceptionTypeEnum {
  /**
   * 构建的API结构不符合要求
   */
  ERR_API_VALIDATION = 'ERR_API_VALIDATION',

  /**
   * 发送的数据格式不正确。应该符合 Request 结构
   */
  ERR_REQUEST_DTO_VALIDATION = 'ERR_REQUEST_DTO_VALIDATION',

  /**
   * 业务层面的发送数据校验失败了
   */
  ERR_REQUEST_DATA_VALIDATION = 'ERR_REQUEST_DATA_VALIDATION',

  /**
   * 返回的数据格式不正确，应该符合 Reponse 结构
   */
  ERR_RESPONSE_DTO_VALIDATION = 'ERR_RESPONSE_DTO_VALIDATION',

  /**
   * 业务层面的返回的数据校验失败了
   */
  ERR_RESPONSE_DATA_VALIDATION = 'ERR_RESPONSE_DATA_VALIDATION',

  /**
   * 业务层面的返回的数据结构校验失败了
   */
  ERR_RESPONSE_DATA_STRUCT_VALIDATION = 'ERR_RESPONSE_DATA_STRUCT_VALIDATION',

  /**
   * 使用JSON.parse对结果数据转换失败了
   */
  ERR_RESPONSE_DATA_TRANSFORM = 'ERR_RESPONSE_DATA_TRANSFORM',

  /**
   * 配置参数不正确
   */
  ERR_CONFIG_VALIDATION = 'ERR_CONFIG_VALIDATION',

  /**
   * 真正的发起http请求的处理函数出错了
   */
  ERR_REQUEST_EXECUTOR = 'ERR_REQUEST_EXECUTOR',
}

export class RequestException extends Error {
  declare data?: unknown;

  declare type: RequestExceptionTypeEnum;

  declare detail: any;

  declare customMessage?: string;

  constructor(
    message: string,
    payload: {
      type: RequestExceptionTypeEnum;
      data?: unknown;
      detail?: any;
      customMessage?: string;
    },
  ) {
    super(message);

    this.name = 'RequestException';
    this.type = payload.type;
    this.data = payload.data;
    this.detail = payload.detail;
    this.customMessage = payload.customMessage;
  }
}

export const RequestMethod = z.enum([
  // 'get',
  'GET',
  // 'delete',
  'DELETE',
  // 'head',
  'HEAD',
  // 'options',
  'OPTIONS',
  // 'post',
  'POST',
  // 'put',
  'PUT',
  // 'patch',
  'PATCH',
  // 'purge',
  'PURGE',
  // 'link',
  'LINK',
  // 'unlink',
  'UNLINK',
  // 'trace',
  'TRACE',
  // 'connect',
  'CONNECT',
]);

export type RequestMethodType = z.output<typeof RequestMethod>;

export const RequestHeaders = z.record(z.string().min(1), z.string());
export const RequestBody = z.any();
export const ResponseType = z.enum([
  'arraybuffer',
  'blob',
  'document',
  /**
   * 如果返回结果是字符串会尝试使用`JSON.parse`
   */
  'json',
  'text',
  'stream',
]);

export type ResponseTypeList = z.output<typeof ResponseType>;

export const Request = z.object({
  url: z.string().min(1),
  method: RequestMethod.default('GET'),
  headers: RequestHeaders.default({}),
  data: RequestBody.default({}),
  responseType: ResponseType.default('json'),
  /**
   * 自定义数据
   */
  custom: z.record(z.string(), z.any()).default({}),
}).passthrough();

export interface RequestInput extends z.input<typeof Request> {}

export interface RequestOutput extends z.output<typeof Request> {}

export const ResponseHeaders = z.record(z.string().min(1), z.string());
export const ResponseCookies = z.array(z.string());

export const BaseResponse = z.object({
  data: z.any().default(null),
  /**
   * http请求状态码
   */
  status: z.number().int(),
  statusText: z.string().default(''),
  headers: ResponseHeaders.default({}),
  cookies: ResponseCookies.default([]),
});
export const Response = BaseResponse.passthrough();

export interface ResponseInput<T> extends z.input<typeof BaseResponse> {
  data?: T;
}

export interface ResponseOutput<T> extends z.output<typeof BaseResponse> {
  data?: T;
}

export type AugmentedResponseOutput<T> = AugmentedRequired<ResponseOutput<T>, 'data'>;

export const RequestApiSchema = z.object({
  /**
   * 基路径
   */
  baseUrl: z.string().default(''),

  url: z.string().min(1),

  method: RequestMethod.default('GET'),

  responseType: ResponseType.default('json'),

  headers: z.optional(z.function().args(
    z.any(),
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
  custom: z.record(z.string(), z.any()).default({}),
});

export interface RequestApiSchemaInput extends z.input<typeof RequestApiSchema> {}

export interface RequestApiSchemaOutput extends z.output<typeof RequestApiSchema> {}

interface CRequestApi<D> extends Omit<z.input<typeof RequestApiSchema>, 'response'> {
  data?: z.ZodType<any, any, D>;
}

export interface RequestApi<D, R> extends Pick<z.output<typeof RequestApiSchema>, 'response'>, CRequestApi<D> {
  response?: z.ZodType<R, any, any>;
}

/**
 * 仅仅是为了类型定义
 */
export function defineRequestApi<D, R>(input: RequestApi<D, R>): RequestApi<D, R> {
  return input;
}

const PathParamsPattern = '(:[a-zA-Z_]\\w*)';

export const RequestOptions = z.object({
  /**
   * @default false
   */
  loading: z.boolean().default(false),
  loadingText: z.string().default(''),
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
  timeout: z.number().default(20000),
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
  custom: z.record(z.string(), z.any()).default({}),
}).passthrough();

export interface RequestOptionsInput extends z.input<typeof RequestOptions> {}

export interface RequestOptionsOutput extends z.output<typeof RequestOptions> {}

function findPathParams(url: string, match = PathParamsPattern) {
  const reg = new RegExp(match, 'g');
  const matchRes = url.match(reg);

  if (matchRes) {
    return matchRes;
  }

  return [];
}

/**
 * 对于类似`user/:userId/info` 路径处理
 * @example
 * ```ts
 * transformUrl('user/:userId/info', { userId: '123456' }, '(:\\w+)') // => 'user/123456/info'
 * ```
 */
function transformUrl(url: string, params: Record<string, unknown>, match?: string) {
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

function getUrl(baseUrl: string, path: string) {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  return baseUrl + path;
}

export type Fetcher = (request: RequestOutput, api: RequestApiSchemaOutput, requestOpts: RequestOptionsOutput) => Promise<ResponseInput<unknown>>;

export async function request<D, R>(
  fetcher: Fetcher,
  apiInput: RequestApi<D, R>,
  data: D,
  opts?: RequestOptionsInput,
): Promise<ResponseOutput<R>> {
  let api: RequestApiSchemaOutput;
  try {
    api = RequestApiSchema.parse(apiInput);
  } catch (error) {
    throw new RequestException('Validate API setup failed.',
      {
        type: RequestExceptionTypeEnum.ERR_API_VALIDATION,
        detail: error,
        data: apiInput,
      },
    );
  }

  let options: RequestOptionsOutput;

  try {
    options = RequestOptions.parse(opts || {});
  } catch (error) {
    throw new RequestException('Validate config setup failed.',
      {
        type: RequestExceptionTypeEnum.ERR_CONFIG_VALIDATION,
        detail: error,
        data: opts,
      },
    );
  }
  const { baseUrl, url, method, headers, responseType } = api;

  let _headers: z.output<typeof RequestHeaders>;

  try {
    const h = await headers?.(api) || {};
    _headers = RequestHeaders.parse(h);
  } catch (error) {
    throw new RequestException('Validate API::headers setup failed.',
      {
        type: RequestExceptionTypeEnum.ERR_API_VALIDATION,
        detail: error,
        data: api,
      },
    );
  }
  let _data = data || {};

  if (api.data) {
    try {
      _data = (api.data as z.ZodType<any>).parse(data);
    } catch (error) {
      throw new RequestException('Validate request-data failed.',
        {
          type: RequestExceptionTypeEnum.ERR_REQUEST_DATA_VALIDATION,
          detail: error,
          data: _data,
        },
      );
    }
  }

  let request: RequestOutput;

  try {
    request = Request.parse({
      url: transformUrl(getUrl(baseUrl, url), _data, options.pathParamsPattern),
      method,
      headers: { ..._headers, ...options.headers },
      responseType,
      data: _data,
      custom: api.custom,
    });
  } catch (error) {
    throw new RequestException('Validate request struct failed.',
      {
        type: RequestExceptionTypeEnum.ERR_REQUEST_DTO_VALIDATION,
        detail: error,
        data: api,
      },
    );
  }

  let res: ResponseInput<unknown>;

  try {
    res = await fetcher(request, api, options);
  } catch (error) {
    throw new RequestException('requestExecutor error occurrence.',
      {
        type: RequestExceptionTypeEnum.ERR_REQUEST_EXECUTOR,
        detail: error,
        data: api,
      },
    );
  }

  let response: ResponseOutput<any>;

  try {
    response = Response.parse(res);
  } catch (error) {
    throw new RequestException('Validate response struct failed.',
      {
        type: RequestExceptionTypeEnum.ERR_RESPONSE_DTO_VALIDATION,
        detail: error,
        data: res,
      },
    );
  }

  try {
    if (request.responseType === 'json') {
      if (typeof response.data === 'string') {
        response.data = JSON.parse(response.data);
      }
    }
  } catch (error) {
    throw new RequestException('Transform response-data to JSON object failed.',
      {
        type: RequestExceptionTypeEnum.ERR_RESPONSE_DATA_TRANSFORM,
        detail: error,
        data: response,
      },
    );
  }

  try {
    if (api.responseStruct) {
      (api.responseStruct as z.ZodType<any>).parse(response.data);
    }
  } catch (error) {
    throw new RequestException('Validate response-data-struct failed.',
      {
        type: RequestExceptionTypeEnum.ERR_RESPONSE_DATA_STRUCT_VALIDATION,
        detail: error,
        data: response,
      },
    );
  }

  try {
    if (api.response) {
      response.data = (api.response as z.ZodType<any>).parse(response.data);
    }
  } catch (error) {
    throw new RequestException('Validate response-data failed.',
      {
        type: RequestExceptionTypeEnum.ERR_RESPONSE_DATA_VALIDATION,
        detail: error,
        data: response,
      },
    );
  }

  return response;
}
