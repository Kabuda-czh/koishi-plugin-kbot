/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:43:47
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-07-17 14:54:56
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\bilibili\dynamic\index.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */

import type { Argv, Channel, Context, Dict } from 'koishi'
import { Logger, Schema } from 'koishi'
import {} from 'koishi-plugin-puppeteer'

import type { BilibiliDynamicItem, DynamicNotifiction } from '../model'
import { getDynamic } from '../utils'

import { dynamicStrategy } from './dynamic.strategy'
import { listen } from './listen'

declare module '..' {
  interface BilibiliChannel {
    dynamic?: DynamicNotifiction[]
  }
}

export interface IConfig {
  interval: number
  device: 'pc' | 'mobile'
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
      '-a <upInfo:string> 添加订阅, 请输入要添加的 up 主的 uid 或者 名字',
      {
        authority: config.authority,
      },
    )
    .option(
      'batch',
      '-b [...upInfo:string] 批量添加订阅, 请输入要添加的 up 主的 uid 或者 名字, 以逗号分隔',
      {
        authority: config.authority,
      },
    )
    .option(
      'remove',
      '-r <upInfo:string> 移除订阅, 请输入要移除的 up 主的 uid 或者 名字',
      {
        authority: config.authority,
      },
    )
    .option(
      'search',
      '-s <upInfo:string> 查看最新动态, 请输入要查看动态的 up 主的 uid 或者 名字',
      { authority: config.authority },
    )
    .option('list', '-l 展示当前订阅 up 主列表', { authority: config.authority })
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
    .option('refresh', '--re 更新 vup', { authority: config.authority })
    .option('cookie', '--ck <cookie:string> 更新 cookie', {
      authority: config.authority,
    })
    .example('使用方法: bilibili -a 123456 或者 bilibili -a 名字')
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
  ctx: Context,
  uid: string,
): Promise<BilibiliDynamicItem[]> {
  try {
    const res = await getDynamic(ctx, uid, logger)
    if (res.code !== 0)
      throw new Error(res.message + (res.code === -352 ? ' (可能为 cookie 失效)' : ''))

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
