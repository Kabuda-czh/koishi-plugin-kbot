/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:43:47
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-04-06 11:10:40
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\bilibili\dynamic\index.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import * as fs from 'node:fs'

import type { Argv, Channel, Context, Dict, Quester } from 'koishi'
import { Logger, Schema } from 'koishi'
import {} from 'koishi-plugin-puppeteer'

import type { BilibiliDynamicItem, DynamicNotifiction } from '../model'
import { getDynamic } from '../utils'

import { bilibiliDir, kbotDir } from '../../../config'
import { dynamicStrategy } from './dynamic.strategy'
import { listen } from './listen'

declare module '..' {
  interface BilibiliChannel {
    dynamic?: DynamicNotifiction[]
  }
}

export interface IConfig {
  interval: number
  device: string
  live: boolean
  authority: number
  useImage?: boolean
}

export const Config: Schema<IConfig> = Schema.object({
  interval: Schema.number()
    .description('请求之间的间隔 (秒) 注: 最低 10 秒!')
    .default(10)
    .min(10),
  device: Schema.union([
    Schema.const('pc').description('电脑'),
    Schema.const('mobile').description('手机'),
  ])
    .default('pc')
    .description('截图类型 (手机/电脑), 需要开启图片模式'),
  live: Schema.boolean().description('是否监控开始直播的动态').default(true),
  useImage: Schema.boolean().default(false).description('是否使用图片模式 (需要 puppeteer 支持!)'),
  authority: Schema.number()
    .default(2)
    .min(1)
    .description('设定指令的最低权限, 默认 2 级'),
})

export const logger = new Logger('KBot-bilibili-dynamic')

export async function apply(ctx: Context, config: IConfig) {
  const channels = await ctx.database.get('channel', {}, [
    'id',
    'guildId',
    'platform',
    'bilibili',
  ])

  const fileNames = await fs.promises.readdir(kbotDir)

  if (!fileNames.includes('bilibili'))
    await fs.promises.mkdir(bilibiliDir, { recursive: true })

  const list = channels
    .filter(channel => channel.bilibili.dynamic)
    .reduce((acc, x) => {
      x.bilibili.dynamic.forEach((notification) => {
        (acc[notification.bilibiliId] ||= []).push([x, notification])
      })
      return acc
    }, {} as Dict<[Pick<Channel, 'id' | 'guildId' | 'platform' | 'bilibili'>, DynamicNotifiction][]>)

  ctx
    .guild()
    .command('kbot/bilibili', 'b站相关')
    .channelFields(['id', 'guildId', 'platform', 'bilibili'])
    .before(checkDynamic)
    .usage(`最低权限: ${config.authority} 级`)
    .option(
      'add',
      '-a <uid:string> 添加订阅, 请输入要添加的 up 主的 uid 或者 名字 或者 空间短链',
      {
        authority: config.authority,
      },
    )
    .option(
      'remove',
      '-r <uid:string> 移除订阅, 请输入要移除的 up 主的 uid 或者 名字 或者 空间短链',
      {
        authority: config.authority,
      },
    )
    .option(
      'search',
      '-s <upInfo:string> 查看最新动态, 请输入要查看动态的 up 主的 uid 或者 名字 或者 空间短链',
      { authority: config.authority },
    )
    .option('list', '-l 展示当前订阅up主列表', { authority: config.authority })
    .option(
      'vup',
      '-v <upInfo:string> 查成分, 请输入要查看成分的 up 主的 uid 或者 名字',
      { authority: config.authority },
    )
    .option(
      'danmu',
      '-d <upInfo:string> 查弹幕, 请输入要查看弹幕的 up 主的 uid 或者 名字',
      { authority: config.authority },
    )
    .option('refresh', '--re 更新vup', { authority: config.authority })
    .option('cookie', '--ck <cookie:string> 更新cookie', {
      authority: config.authority,
    })
    .action(async ({ session, options }) => {
      if (Object.keys(options).length > 1)
        return '请不要同时使用多个参数'

      return dynamicStrategy({ session, options }, list, ctx, config)
    })

  const generator = listen(list, request, ctx, config)
  ctx.setInterval(async () => {
    await generator.next()
  }, config.interval * 1000)
}

function checkDynamic({ session }: Argv<never, 'bilibili'>) {
  session.channel.bilibili.dynamic ||= []
}

async function request(
  uid: string,
  http: Quester,
): Promise<BilibiliDynamicItem[]> {
  try {
    const res = await getDynamic(http, uid)
    return (res.data.items as BilibiliDynamicItem[]).sort(
      (a, b) => b.modules.module_author.pub_ts - a.modules.module_author.pub_ts,
    )
  }
  catch (e) {
    if (['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'ECONNABORTED', 'read ECONNRESET'].includes(e.code))
      return []
    throw e.message
  }
}
