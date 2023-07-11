/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:43:47
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-07-11 11:31:12
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\twitter\dynamic\index.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import * as fs from 'node:fs'
import type { Argv, Channel, Context, Dict } from 'koishi'
import { Logger, Schema } from 'koishi'
import {} from 'koishi-plugin-puppeteer'

import type { DynamicNotifiction } from '../model'
import { getTwitterTweets } from '../utils'
import { generatePaths } from '../../../config'
import { listen } from './listen'
import { dynamicStrategy } from './dynamic.strategy'

declare module '..' {
  interface TwitterChannel {
    dynamic?: DynamicNotifiction[]
  }
}

export interface IConfig {
  interval: number
  useImage?: boolean
  usePure?: boolean
  onlyMedia?: boolean
  authority: number
}

export const Config: Schema<IConfig> = Schema.object({
  interval: Schema.number()
    .description('请求之间的间隔 (秒) 注: 最低 30 秒!')
    .default(30)
    .min(30),
  useImage: Schema.boolean().default(false).description('是否使用图片模式 (需要 puppeteer 支持!)'),
  usePure: Schema.boolean()
    .default(false)
    .description(
      '是否使用纯净推送 注: 指过滤掉引用和转发, 且仅仅会覆盖掉自动推送模式',
    ),
  authority: Schema.number()
    .default(2)
    .min(1)
    .description('设定指令的最低权限, 默认 2 级'),
  onlyMedia: Schema.boolean().default(false).description('是否只推送媒体动态'),
})

export const logger = new Logger('KBot-twitter-dynamic')

export async function apply(ctx: Context, config: IConfig) {
  const channels = await ctx.database.get('channel', {}, [
    'id',
    'guildId',
    'platform',
    'twitter',
  ])

  const { kbotDir, twitterDir, twitterCookiePath } = generatePaths(ctx.baseDir)

  const fileNames = await fs.promises.readdir(kbotDir)

  if (!fileNames.includes('twitter')) {
    await fs.promises.mkdir(twitterDir, { recursive: true })
    await fs.promises.writeFile(
      twitterCookiePath,
      JSON.stringify({ cookies: '' }),
      { encoding: 'utf-8' },
    )
  }

  const list = channels
    .filter(channel => channel.twitter.dynamic)
    .reduce((acc, x) => {
      x.twitter.dynamic.forEach((notification) => {
        (acc[notification.twitterRestId] ||= []).push([x, notification])
      })
      return acc
    }, {} as Dict<[Pick<Channel, 'id' | 'guildId' | 'platform' | 'twitter'>, DynamicNotifiction][]>)

  ctx
    .guild()
    .command('kbot/twitter', 'Twitter 相关功能')
    .channelFields(['id', 'guildId', 'platform', 'twitter'])
    .before(checkDynamic)
    .usage(`最低权限: ${config.authority} 级`)
    .option(
      'add',
      '-a <userId:string> 添加订阅, 请输入要添加的 twitter 博主的 id 名字(指 @后的字符串)',
      { authority: config.authority },
    )
    .option(
      'batch',
      '-b [...userId:string] 批量添加订阅, 请输入要添加的 twitter 博主的 id 名字(指 @后的字符串), 以逗号分隔',
      { authority: config.authority },
    )
    .option(
      'remove',
      '-r <userId:string> 移除订阅, 请输入要移除的 twitter 博主的 id 名字(指 @后的字符串)',
      { authority: config.authority },
    )
    .option(
      'search',
      '-s <userId:string> 查看最新动态, 请输入要查看动态的 twitter 博主的 id 名字(指 @后的字符串)',
      { authority: config.authority },
    )
    .option(
      'cookie',
      '-ck <cookie:string> 设置 twitter cookie, 请在登录 twitter 后使用浏览器的开发者工具获取',
      { authority: config.authority },
    )
    .option('list', '-l 展示当前订阅 twitter 博主列表', {
      authority: config.authority,
    })
    .example('使用方法: twitter -a xxxxx')
    .action(async ({ session, options }) => {
      if (Object.keys(options).length > 1)
        return '请不要同时使用多个参数'

      return dynamicStrategy({ session, options }, list, ctx, config)
    })

  try {
    const cookieJson = await fs.promises.readFile(
      twitterCookiePath,
      { encoding: 'utf-8' },
    )
    const cookie = JSON.parse(cookieJson)
    if (!cookie) {
      logger.warn('未检测到 cookie, 请使用 twitter --ck <cookie> 设置')
    }
    else {
      ctx.http.config.headers['x-csrf-token'] = cookie.authCookie.ct0
      ctx.http.config.headers.Cookie = cookie.cookieString
    }
  }
  catch {
    logger.warn('未检测到 cookie, 请使用 twitter --ck <cookie> 设置')
  }

  const generator = listen(list, getTwitterTweets, ctx, config)
  ctx.setInterval(async () => {
    await generator.next()
  }, config.interval * 1000)
}

function checkDynamic({ session }: Argv<never, 'twitter'>) {
  session.channel.twitter.dynamic ||= []
}
