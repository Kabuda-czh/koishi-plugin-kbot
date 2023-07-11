/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:28:53
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-07-11 18:27:49
 * @FilePath: \KBot-App\plugins\kbot\src\index.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import fs from 'node:fs'
import type { Context } from 'koishi'
import { Logger, Schema } from 'koishi'

import * as botBasic from './basic'

import * as bilibiliPlugin from './plugins/bilibili'
import * as musicPlugin from './plugins/music'
import * as youtubePlugin from './plugins/youtube'
import * as managePlugin from './plugins/guildManage'
import * as twitterPlugin from './plugins/twitter'
import * as tarotPlugin from './plugins/tarot'

import {} from 'koishi-plugin-downloads'

// import * as valorantPlugin from './plugins/valorant'

import { generatePaths } from './config'
import { downloadAndMoveFiles } from './plugins/utils'

export const name = 'kbot'

export const usage = `
# KBot v1.1.0 更新日志

## Note
- 修复 \`twitter\` 插件异常问题
- 修复 \`bilibili\` 插件问题
- 增加使用 \`downloads\` 插件

## Bug Fix
- 修复 \`twitter\` 因为使用 \`cookie\` 加入 \`pptr\` 方法渲染页面, 增加等待时间
- 修复 \`bilibili\` 因 \`-352\` 的问题, 增加对应打印
- 修复静态指定路径, 使用 \`ctx.baseDir\` 创建 \`kbot\` 所需的资源路径

## Features
- 增加使用 \`downloads\` 插件, 下载对应所需 \`文字\` 和 \`图片\` 减少 \`kbot\` 插件大小

详细更新日志请看: [Release](https://github.com/Kabuda-czh/koishi-plugin-kbot/releases/tag/1.1.0)
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

export const using = ['console', 'database', 'downloads'] as const

export async function apply(ctx: Context, config: IConfig) {
  if (!config.superAdminQQ || config.superAdminQQ.length === 0) {
    logger.error('未设置超级管理员QQ号')
  }
  else {
    const { kbotDir } = generatePaths(ctx.baseDir)

    let fileNames: string[] = []
    let createFlag = false
    try {
      fileNames = await fs.promises.readdir(kbotDir)
    }
    catch (e) {
      logger.error('未找到 kbot-data 文件夹, 正在创建')
      await fs.promises.mkdir(kbotDir)
      createFlag = true
    }

    if (!createFlag && fileNames.length === 0)
      await fs.promises.mkdir(kbotDir)

    if (!fileNames.includes('fonts')) {
      await downloadAndMoveFiles('task1', 'fonts', [
        'npm://koishi-plugin-kbot-assets',
        'npm://koishi-plugin-kbot-assets?registry=https://registry.npmmirror.com',
      ], ctx, kbotDir, logger)
    }

    if (!fileNames.includes('images')) {
      await downloadAndMoveFiles('task2', 'images', [
        'npm://koishi-plugin-kbot-assets',
        'npm://koishi-plugin-kbot-assets?registry=https://registry.npm.taobao.org',
      ], ctx, kbotDir, logger)
    }

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
