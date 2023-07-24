/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:43:27
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-07-24 12:00:16
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\bilibili\index.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import fs from 'node:fs'
import type { Context } from 'koishi'
import { Quester, Schema } from 'koishi'
import GeneratePath from '../../config'
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
  url: boolean
  quester: Quester.Config
}

export const Config: Schema<IConfig> = Schema.object({
  dynamic: dynamic.Config.description(
    '动态监听 (使用 dynamic 指令管理监听对象)',
  ),
  url: Schema.boolean().default(true).description('是否启用 URL 自动解析'),
  quester: Quester.Config.description('Bilibili 请求配置'),
})

export async function apply(context: Context, config: IConfig) {
  context.guild().command('kbot/bilibili', 'Bilibili 相关功能')

  context.model.extend('channel', {
    bilibili: {
      type: 'json',
      initial: {},
    },
  })

  const { kbotDir, bilibiliDir } = GeneratePath.getInstance(context.baseDir).getGeneratePathData()

  const fileNames = await fs.promises.readdir(kbotDir)

  if (!fileNames.includes('bilibili'))
    await fs.promises.mkdir(bilibiliDir, { recursive: true })

  const ctx = context.isolate(['http'])

  ctx.http = context.http.extend({
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
      ...config.quester.headers,
    },
    ...config.quester,
  })

  ctx.plugin(dynamic, config.dynamic)
  if (config.url)
    ctx.plugin(url)
}
