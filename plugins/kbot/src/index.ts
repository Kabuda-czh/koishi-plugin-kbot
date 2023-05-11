/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:28:53
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-05-11 11:22:56
 * @FilePath: \KBot-App\plugins\kbot\src\index.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import * as fs from 'node:fs'
import type { Context } from 'koishi'
import { Logger, Schema } from 'koishi'

import * as botBasic from './basic'

import * as bilibiliPlugin from './plugins/bilibili'
import * as musicPlugin from './plugins/music'
import * as youtubePlugin from './plugins/youtube'
import * as managePlugin from './plugins/guildManage'
import * as twitterPlugin from './plugins/twitter'
import * as tarotPlugin from './plugins/tarot'
// import * as valorantPlugin from './plugins/valorant'

import { kbotDir, publicDir } from './config'

export const name = 'kbot'

export const usage = `
# KBot v1.0.4 更新日志

## Note
- 修复 \`messages\` 插件依赖
- 更新 \`guildmanage\` 插件 \`recall\` 功能

## Features
- 更新 \`guildmanage\` 插件中 \`recall\` 功能在不依赖 \`messages\` 后获取历史记录并撤回的功能 [be22a26](https://github.com/Kabuda-czh/koishi-plugin-kbot/commit/be22a26210e5255f7e1ef1c4711e2a66c3709e59)

## Bug Fix
- 移除了 \`messages\` 依赖导致的内存飙升以及 \`sqlite\` 崩溃等问题 [be22a26](https://github.com/Kabuda-czh/koishi-plugin-kbot/commit/be22a26210e5255f7e1ef1c4711e2a66c3709e59)
`

interface IPluginEnableConfig {
  enabled: boolean
}

interface IConfig {
  superAdminQQ?: string[]
  KBotBasic?: botBasic.IConfig
  KBotManage?: managePlugin.IConfig & IPluginEnableConfig
  KBotBilibili?: bilibiliPlugin.IConfig & IPluginEnableConfig
  KBotMusic?: musicPlugin.IConfig & IPluginEnableConfig
  KBotYoutube?: youtubePlugin.IConfig & IPluginEnableConfig
  KBotTwitter?: twitterPlugin.IConfig & IPluginEnableConfig
  KBotTarot?: tarotPlugin.IConfig & IPluginEnableConfig
}

const pluginLoad = <T>(schema: Schema<T>): Schema<T & IPluginEnableConfig> =>
  Schema.intersect([
    Schema.object({
      enabled: Schema.boolean().default(false).description('是否启用插件'),
    }),
    Schema.union([
      Schema.object({
        enabled: Schema.const(true).required(),
        ...schema.dict,
      }),
      Schema.object({
        enabled: Schema.const(false),
      }),
    ]) as Schema<T>,
  ])

export const Config: Schema<IConfig> = Schema.object({
  superAdminQQ: Schema.array(String).description('超级管理员QQ号 (必填)'),
  KBotBasic: botBasic.Config,
  KBotManage: pluginLoad(managePlugin.Config).description('群管理功能'),
  KBotBilibili: pluginLoad(bilibiliPlugin.Config).description(
    'Bilibili 动态推送',
  ),
  KBotMusic: pluginLoad(musicPlugin.Config).description('点歌功能'),
  KBotYoutube: pluginLoad(youtubePlugin.Config).description('Youtube 视频解析'),
  KBotTwitter: pluginLoad(twitterPlugin.Config).description('Twitter 动态推送 (必须要 puppeteer)'),
  KBotTarot: pluginLoad(tarotPlugin.Config).description('塔罗牌功能'),
})

export const logger = new Logger('KBot')

export const using = ['console', 'database'] as const

export async function apply(ctx: Context, config: IConfig) {
  if (!config.superAdminQQ || config.superAdminQQ.length === 0) {
    logger.error('未设置超级管理员QQ号')
  }
  else {
    let fileNames: string[] = []
    try {
      fileNames = await fs.promises.readdir(publicDir)
    }
    catch (e) {
      logger.error('未找到 public 文件夹, 正在创建')
      await fs.promises.mkdir(publicDir)
    }

    if (!fileNames.includes('kbot'))
      await fs.promises.mkdir(kbotDir)

    ctx.bots.forEach(async (bot) => {
      if (
        !['connect', 'online'].includes(bot.status)
        || bot.platform === 'qqguild'
      )
        return
      config.superAdminQQ.forEach(async (qq) => {
        await ctx.database.getUser(bot.platform, qq).then((user) => {
          try {
            if (user && user?.authority < 5) {
              ctx.database.setUser(bot.platform, qq, {
                authority: 5,
              })
              logger.success(`已将QQ号为 ${qq} 的用户权限设置为 5 级`)
            }
            else if (!user) {
              ctx.database.createUser(bot.platform, qq, {
                authority: 5,
              })
              logger.success(`已成功创建QQ号为 ${qq} 的用户, 并赋予权限 5 级`)
            }
          }
          catch (err) {
            logger.error(`设置QQ号为 ${qq} 的用户权限时出错: ${err}`)
          }
        })
      })
    })

    ctx.command('kbot', 'kbot 相关功能')

    ctx.on('friend-request', async (session) => {
      await ctx.database.getUser(session.platform, session.userId).then(async (user) => {
        if (user.authority >= 3)
          await session.bot.handleFriendRequest(session.messageId, true)
      })
    })

    ctx.on('guild-request', async (session) => {
      await ctx.database.getUser(session.platform, session.userId).then(async (user) => {
        if (user.authority >= 3)
          await session.bot.handleGuildRequest(session.messageId, true)
      })
    })

    ctx.plugin(botBasic, config.KBotBasic)

    if (config.KBotManage.enabled)
      ctx.plugin(managePlugin, config.KBotManage)
    if (config.KBotBilibili.enabled)
      ctx.plugin(bilibiliPlugin, config.KBotBilibili)
    if (config.KBotMusic.enabled)
      ctx.plugin(musicPlugin, config.KBotMusic)
    if (config.KBotYoutube.enabled)
      ctx.plugin(youtubePlugin, config.KBotYoutube)
    if (config.KBotTwitter.enabled)
      ctx.plugin(twitterPlugin, config.KBotTwitter)
    if (config.KBotTarot.enabled)
      ctx.plugin(tarotPlugin, config.KBotTarot)

    // ctx.plugin(valorantPlugin)

    logger.success('KBot 内置插件加载完毕')
  }
}
