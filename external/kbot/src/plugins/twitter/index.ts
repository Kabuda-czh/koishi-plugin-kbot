/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:43:27
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2024-05-24 11:34:24
 * @FilePath: \kbot-app-new\external\kbot\src\plugins\twitter\index.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import type { Context } from 'koishi'
import { Quester, Schema } from 'koishi'
import * as dynamic from './dynamic'

export interface TwitterChannel {}

declare module 'koishi' {
  interface Channel {
    twitter: TwitterChannel
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
  quester: Quester.Config.description('twitter 请求配置'),
})

export function apply(context: Context, config: IConfig) {
  context.guild().command('kbot/twitter', 'Twitter 相关功能')

  context.model.extend('channel', {
    twitter: {
      type: 'json',
      initial: {},
    },
  })

  //@ts-ignore
  // TODO: 需要修复
  const ctx = context.isolate(['http'])

  ctx.http = context.http.extend({
    headers: {
      'User-Agent': 'PostmanRuntime/7.31.0',
      'Authorization':
        'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs=1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
      ...config.quester.headers,
    },
    ...config.quester,
  })

  ctx.plugin(dynamic, config.dynamic)
}
