import type { ApiResult, FileResult } from './envelope';
import type { HttpClient, HttpMethod, HttpRequestOptions } from './http';

/*
 * Compile-time view of an API from its generated `paths` type: only paths the API has can be called, with the method it
 * accepts, its path and query parameters, its request body, and the type of `data` in its response.
 */

type OperationOf<P, K extends keyof P, M extends HttpMethod> = P[K] extends Record<M, infer O> ? O : never;

/** The paths of P that accept method M. */
export type PathsWith<P, M extends HttpMethod> = {
  [K in keyof P]: P[K] extends Record<M, infer O> ? ([O] extends [undefined] ? never : K) : never;
}[keyof P] &
  string;

type ParametersOf<O> = O extends { parameters: infer X } ? X : object;

type PathParams<O> = ParametersOf<O> extends { path: infer X } ? X : undefined;

type QueryParams<O> = ParametersOf<O> extends { query?: infer X } ? ([X] extends [undefined] ? undefined : X) : undefined;

type JsonBody<O> = O extends { requestBody?: never }
  ? undefined
  : O extends { requestBody?: { content: { 'application/json': infer B } } }
    ? B
    : undefined;

type AcceptsUpload<O> = O extends { requestBody?: never }
  ? false
  : O extends { requestBody?: { content: { 'multipart/form-data': unknown } } }
    ? true
    : false;

type Success<O> = O extends { responses: infer R } ? R[Extract<keyof R, 200 | 201>] : never;

/** The type of `data` in an operation's successful response; null when it returns none. */
export type ResponseData<O> =
  Success<O> extends { content: { 'application/json': { data?: infer D } } } ? Exclude<D, null | undefined> : null;

/** The options an operation takes: its path values, query, body (JSON, or FormData for an upload), signal, headers. */
export type OperationOptions<O> = { signal?: AbortSignal; headers?: Readonly<Record<string, string>> } & (PathParams<O> extends undefined
  ? { path?: undefined }
  : { path: PathParams<O> }) &
  (QueryParams<O> extends undefined ? { query?: undefined } : { query?: QueryParams<O> }) &
  (JsonBody<O> extends undefined ? (AcceptsUpload<O> extends true ? { body: FormData } : { body?: undefined }) : { body: JsonBody<O> });

type Args<T> = object extends T ? [options?: T] : [options: T];

type Call<P, M extends HttpMethod> = <K extends PathsWith<P, M>>(
  path: K,
  ...args: Args<OperationOptions<OperationOf<P, K, M>>>
) => Promise<ApiResult<ResponseData<OperationOf<P, K, M>>>>;

/** A typed view of one API. */
export interface ApiClient<P> {
  readonly http: HttpClient;
  get: Call<P, 'get'>;
  post: Call<P, 'post'>;
  put: Call<P, 'put'>;
  patch: Call<P, 'patch'>;
  delete: Call<P, 'delete'>;
  /** A file endpoint (PDF, Excel, document): the bytes and the file name the API gave. */
  download: <K extends PathsWith<P, 'get'>>(path: K, ...args: Args<OperationOptions<OperationOf<P, K, 'get'>>>) => Promise<FileResult>;
}

/** Types the shared HTTP client with an API's generated paths; P is the `paths` type of @cyient/api-client/<app>. */
export function createApiClient<P>(http: HttpClient): ApiClient<P> {
  const call =
    (method: HttpMethod) =>
    (path: string, options?: HttpRequestOptions): Promise<ApiResult<unknown>> =>
      http.request<unknown>(method, path, options);

  return {
    http,
    get: call('get') as Call<P, 'get'>,
    post: call('post') as Call<P, 'post'>,
    put: call('put') as Call<P, 'put'>,
    patch: call('patch') as Call<P, 'patch'>,
    delete: call('delete') as Call<P, 'delete'>,
    download: ((path: string, options?: HttpRequestOptions) => http.download(path, options)) as ApiClient<P>['download'],
  };
}
