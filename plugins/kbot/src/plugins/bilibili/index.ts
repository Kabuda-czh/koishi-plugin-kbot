/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:43:27
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-09 15:29:55
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\bilibili\index.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import type { Context } from 'koishi'
import { Quester, Schema } from 'koishi'
import * as dynamic from './dynamic'
import * as url from './url'

export interface BilibiliChannel {}

declare module 'koishi' {
  interface Channel {
    bilibili: BilibiliChannel
  }
}

export interface IConfig {
  dynamic: dynamic.IConfig
  quester: Quester.Config
}

export const Config: Schema<IConfig> = Schema.object({
  dynamic: dynamic.Config.description(
    '动态监听 (使用 dynamic 指令管理监听对象)',
  ),
  quester: Quester.Config.description('Bilibili 请求配置'),
})

export function apply(context: Context, config: IConfig) {
  context.model.extend('channel', {
    bilibili: {
      type: 'json',
      initial: {},
    },
  })

  const ctx = context.isolate(['http'])

  ctx.http = context.http.extend({
    headers: {
      'User-Agent':
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
      ...config.quester.headers,
    },
    ...config.quester,
  })

  ctx.plugin(dynamic, config.dynamic)
  ctx.plugin(url)
}
