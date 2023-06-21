/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:28:53
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-06-21 18:20:10
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

import { assetsLocalDir, kbotDir } from './config'

export const name = 'kbot'

export const usage = `
# KBot v1.0.11 更新日志

## Note
- 修复 \`bilibili\` 插件中, 解析链接的图片发送问题
- 修复 \`bilibili\` 插件中, \`danmuku\` 的 api 请求问题
- 修复 \`bilibili\` 插件中, \`cookie\` 的解析问题
- 修复 \`bilibili\` 插件中, \`danmuku\` 的时间渲染问题
- 修复 \`bilibili\` 插件中, \`add\` 方法请求用户信息的 \`-403\` 问题
- 修复 \`twitter\` 插件中, 轮询 \`undefined\` 问题
- 优化代码

## Bug Fix
- 修复 \`bilibili\` 在解析链接的图片发送异常问题, 更改为 base64 发送 d4d7c95342c6021f95e1fa22bf5db04461238c1b
- 修复 \`bilibili\` 使用 \`danmuku\` 功能时, api 请求失败以及, 主播开播下播时间异常问题 25c9d444df917ee5e4e8808ddc8235ce85164f1c 41279a4853d4bcb21231b4249733d01165366144
- 修复 \`bilibili\` cookie 字符串解析异常问题, 对接b站最新 cookie f2dba93f531804cc362c71c1062463407e4639fa
- 修复 \`bilibili\` 请求用户信息 \`-403\` 异常问题, 增加 \`salt\` 加密算法 e302cd8a3ffa260ac9b7a6d2fd9b6ff37f8cbe3d
- 修复 \`twitter\` 轮询报错问题, 增加可选项避免报错 186b19ae6138ee51352f4268b4d338b758393d64

详细更新日志请看: [Release](https://github.com/Kabuda-czh/koishi-plugin-kbot/releases/tag/1.0.11)
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

function pluginLoad<T>(schema: Schema<T>): Schema<T & IPluginEnableConfig> {
  return Schema.intersect([
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
}

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
      fileNames = await fs.promises.readdir(assetsLocalDir)
    }
    catch (e) {
      logger.error('未找到 public 文件夹, 正在创建')
      await fs.promises.mkdir(assetsLocalDir)
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
