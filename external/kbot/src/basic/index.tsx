/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:28:53
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2024-05-24 11:41:09
 * @FilePath: \kbot-app-new\external\kbot\src\basic\index.tsx
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import type { Context } from 'koishi'
import { Logger, Schema } from 'koishi'
import * as statusPlugin from './status'
import * as ttsPlugin from './tts'

export interface IConfig {
  checkBody?: {
    enabled: boolean
  } & statusPlugin.IConfig
  tts?: boolean
}

export const Config: Schema<IConfig> = Schema.object({
  checkBody: Schema.intersect([
    Schema.object({
      enabled: Schema.boolean().default(false).description('是否开启自带的 status, 等同于插件 `status-pro` (需要 puppeteer)'),
    }),
    Schema.union([
      Schema.object({
        enabled: Schema.const(true).required(),
        ...statusPlugin.Config.dict,
      }),
      Schema.object({
        enabled: Schema.const(false),
      }),
    ]) as statusPlugin.IConfig,
  ]),
  tts: Schema.boolean().default(false).description('是否开启文字转语音, API 来源于 https://www.text-to-speech.cn/'),
})

export const logger = new Logger('KBot-basic')

export async function apply(ctx: Context, config: IConfig) {
  if (config.checkBody.enabled)
    ctx.plugin(statusPlugin, config.checkBody)
  if (config.tts)
    ctx.plugin(ttsPlugin)
}
