/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-02 09:59:42
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-02 11:04:54
 * @FilePath: \KBot-App\plugins\kbot\client\utils\http\types.d.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
export type Method =
  | "get"
  | "GET"
  | "delete"
  | "DELETE"
  | "head"
  | "HEAD"
  | "options"
  | "OPTIONS"
  | "post"
  | "POST"
  | "put"
  | "PUT"
  | "patch"
  | "PATCH"
  | "purge"
  | "PURGE"
  | "link"
  | "LINK"
  | "unlink"
  | "UNLINK";

export type RequestMethods = Extract<
  Method,
  "get" | "post" | "put" | "delete" | "patch" | "options" | "head"
>;

export default class FetchHttp {
  request<T>(
    method: RequestMethods,
    url: string,
    param?: any,
    axiosConfig?: any
  ): Promise<T>;
  post<T, P>(
    url: string,
    params?: T,
    config?: any
  ): Promise<P>;
  get<T, P>(
    url: string,
    params?: T,
    config?: any
  ): Promise<P>;
}