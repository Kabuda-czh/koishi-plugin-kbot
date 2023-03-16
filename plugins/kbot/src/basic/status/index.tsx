/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:28:53
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-03-16 19:13:07
 * @FilePath: \KBot-App\plugins\kbot\src\basic\status\index.tsx
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import fs from 'node:fs'
import path from 'node:path'
import type { Context } from 'koishi'
import { Logger, Schema, version } from 'koishi'
import { renderHtml, renderRandom } from './random'
import { getSystemInfo } from './utils'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version: pVersion } = require('../../../package.json')

export interface IConfig {
  useModel?: any
}

export const Config: Schema<IConfig> = Schema.object({
  useModel: Schema.union([
    Schema.const('neko').description('猫羽雫'),
    Schema.object({
      sort: Schema.union(['random', 'iw233', 'top', 'yin', 'cat', 'xing', 'mp', 'pc']).default('mp').description('请前往 https://mirlkoi.ifast3.vipnps.vip/API/index.php 来选择你想要的 sort'),
    }).description('随机图片'),
  ]),
})

export const logger = new Logger('KBot-status')

export async function apply(ctx: Context, config: IConfig) {
  const fileNames = fs.readdirSync(
    path.resolve(__dirname, '../../../../../public/kbot'),
  )

  if (!fileNames.includes('randomImage')) {
    fs.mkdirSync(
      path.resolve(__dirname, '../../../../../public/kbot/randomImage'),
    )
  }

  ctx.command('kbot/body', '检查机器人状态', {
    checkArgCount: true,
    showWarning: false,
  }).shortcut('自检', { fuzzy: false })
    .action(async ({ session }) => {
      const systemInfo = await getSystemInfo('KBot', version, pVersion, ctx.registry.size)

      if (!config.useModel)
        return await renderHtml(ctx, systemInfo)

      else
        return await renderRandom(ctx, config.useModel.sort, systemInfo.random)
    })
}
