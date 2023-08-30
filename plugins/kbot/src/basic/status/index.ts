/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:28:53
 * @LastEditors: Kabuda-czh 634469564@qq.com
 * @LastEditTime: 2023-08-30 19:49:10
 * @FilePath: \KBot-App\plugins\kbot\src\basic\status\index.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import type { Context } from 'koishi'
import { Logger, Schema, version } from 'koishi'
import { renderHtml, renderRandom } from './render'
import { getSystemInfo } from './utils'

// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
const { version: pVersion } = require('../../../package.json')

export interface IConfig {
  useModel?: any
  botName?: string
}

export const Config: Schema<IConfig> = Schema.object({
  useModel: Schema.union([
    Schema.const('neko').description('猫羽雫'),
    Schema.object({
      sort: Schema.union(['random', 'iw233', 'top', 'yin', 'cat', 'xing', 'mp', 'pc']).default('mp').description('请前往 https://mirlkoi.ifast3.vipnps.vip/API/index.php 来选择你想要的 sort'),
    }).description('随机图片'),
  ]).default('neko').description('请选择你想要的模式'),
  botName: Schema.string().default('KBot').description('在自检图片中显示的名称(如果不填写则显示机器人的昵称, 不要太长哦)'),
})

export const logger = new Logger('KBot-status')

export async function apply(ctx: Context, config: IConfig) {
  ctx.command('kbot/body', '检查机器人状态', {
    checkArgCount: true,
    showWarning: false,
  }).shortcut('自检', { fuzzy: false })
    .action(async ({ session }) => {
      if (!ctx.puppeteer)
        return '未安装/启用 puppeteer 插件，无法使用图片渲染'

      const systemInfo = await getSystemInfo(config.botName || session.bot.username, version, pVersion, ctx.registry.size)

      if (config?.useModel === 'neko')
        return await renderHtml(ctx, systemInfo)

      else
        return await renderRandom(ctx, config.useModel.sort, systemInfo.random, session.bot.selfId)
    })
}
