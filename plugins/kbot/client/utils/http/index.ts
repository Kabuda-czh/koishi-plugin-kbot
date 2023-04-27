/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-02 09:59:05
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-02 13:12:06
 * @FilePath: \KBot-App\plugins\kbot\client\utils\http\index.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import qs from 'qs'
import { message } from '@koishijs/client'
import { isObject } from '../common'
import type { RequestMethods } from './types.d'

class FetchHttp {
  constructor() {}

  public async request<T = any>(
    method: RequestMethods,
    endPoint: string,
    param?: any,
    fetchConfig?: any,
  ): Promise<T> {
    if (!isObject(fetchConfig))
      fetchConfig = {}

    method = method.toLowerCase() as RequestMethods

    fetchConfig = Object.assign(
      {
        url: endPoint,
        method,
        credentials: 'include',
        headers: null,
        body: ['post', 'put', 'patch'].includes(method) ? param : null,
        params: ['get', 'delete', 'head', 'options'].includes(method)
          ? param
          : null,
        responseType: 'json',
        signal: null,
      },
      fetchConfig,
    )

    if (!isObject(fetchConfig.headers))
      fetchConfig.headers = {}
    if (fetchConfig.params !== null && !isObject(fetchConfig.params))
      fetchConfig.params = null

    let { url, headers, body, params, responseType } = fetchConfig

    if (params) {
      url += `${url.includes('?') ? '&' : '?'}${qs.stringify(params, {
        arrayFormat: 'repeat',
      })}`
    }

    if (isObject(body)) {
      body = qs.stringify(body)
      headers['Content-Type'] = 'application/x-www-form-urlencoded'
    }

    fetchConfig.cache = 'no-cache'
    fetchConfig.mode = 'cors'

    return fetch(url, fetchConfig)
      .then((response) => {
        const { status, statusText } = response

        if (!/^(2|3)\d{2}$/.test(String(status)))
          // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject({ code: -1, status, statusText })

        const result = ['text', 'arraybuffer', 'blob'].includes(responseType)
          ? response[responseType]()
          : response.json()
        return result.then(
          (res) => {
            return Promise.resolve(res)
          },
          // eslint-disable-next-line prefer-promise-reject-errors
          reason => Promise.reject({ code: -2, reason }),
        )
      })
      .catch((error) => {
        // TODO 状态判断

        message.error(`请求失败: ${error?.reason || error?.statusText}`)
        return Promise.reject(error)
      })
  }

  public post<T, P>(endPoint: string, params?: T, config?: any): Promise<P> {
    return this.request<P>('post', endPoint, params, config)
  }

  public get<T, P>(endPoint: string, params?: T, config?: any): Promise<P> {
    return this.request<P>('get', endPoint, params, config)
  }
}

export const http = new FetchHttp()
