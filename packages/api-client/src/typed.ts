import type { ApiResult, FileResult } from './envelope';
import type { HttpClient, HttpMethod, HttpRequestOptions } from './http';

export type PathData<P, M extends HttpMethod, Path extends string> = Path extends keyof P
  ? P[Path] extends Record<M, infer Op>
    ? Op extends { responses: infer Resp }
      ? 200 extends keyof Resp
        ? Resp[200] extends { content: { 'application/json': { data?: infer D } } }
          ? Exclude<D, null | undefined>
          : unknown
        : 201 extends keyof Resp
          ? Resp[201] extends { content: { 'application/json': { data?: infer D } } }
            ? Exclude<D, null | undefined>
            : unknown
          : unknown
      : unknown
    : unknown
  : unknown;

export type PathsWith<_P, _M extends HttpMethod = HttpMethod> = string;
export type OperationOptions<_O> = HttpRequestOptions;
export type ResponseData<O> = O extends { responses: { 200: { content: { 'application/json': { data?: infer D } } } } }
  ? Exclude<D, null | undefined>
  : unknown;

export interface ApiClient<P = unknown> {
  readonly http: HttpClient;

  get<T = never, K extends string = string>(
    path: K,
    options?: HttpRequestOptions,
  ): Promise<ApiResult<[T] extends [never] ? PathData<P, 'get', K> : T>>;

  post<T = never, K extends string = string>(
    path: K,
    options?: HttpRequestOptions,
  ): Promise<ApiResult<[T] extends [never] ? PathData<P, 'post', K> : T>>;

  put<T = never, K extends string = string>(
    path: K,
    options?: HttpRequestOptions,
  ): Promise<ApiResult<[T] extends [never] ? PathData<P, 'put', K> : T>>;

  patch<T = never, K extends string = string>(
    path: K,
    options?: HttpRequestOptions,
  ): Promise<ApiResult<[T] extends [never] ? PathData<P, 'patch', K> : T>>;

  delete<T = never, K extends string = string>(
    path: K,
    options?: HttpRequestOptions,
  ): Promise<ApiResult<[T] extends [never] ? PathData<P, 'delete', K> : T>>;

  download(path: string, options?: HttpRequestOptions): Promise<FileResult>;
}

export function createApiClient<P = unknown>(http: HttpClient): ApiClient<P> {
  return {
    http,
    get: (path, options) => http.get(path, options),
    post: (path, options) => http.post(path, options),
    put: (path, options) => http.put(path, options),
    patch: (path, options) => http.patch(path, options),
    delete: (path, options) => http.delete(path, options),
    download: (path, options) => http.download(path, options),
  };
}
