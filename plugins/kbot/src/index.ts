/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:28:53
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-05-20 16:05:26
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
# KBot v1.0.5 更新日志

## Note
- 修复 \`bilibili\` 插件无法搜索用户的问题
- 修复 \`twitter\` 插件查询用户 403 时并未自动获取 token 的问题
- 优化 \`guildmanage\` 插件

## Features
- 优化 \`guildmanage\` 插件代码 [226676e](https://github.com/Kabuda-czh/koishi-plugin-kbot/commit/226676e6d383df30b211d301f212e96a1b8e5eb2) [5a709ed](https://github.com/Kabuda-czh/koishi-plugin-kbot/commit/5a709ed3f259acd9dd3da8ef3fa31d76be29cbf3) [1601dce](https://github.com/Kabuda-czh/koishi-plugin-kbot/commit/1601dceb9199312777ef8155e4f88df006cb067c)
- 添加 \`guildmanage\` ~~监控群功能~~ (因暂时需要 \`messages\` 插件功能, 并未开放) [42d6cfe](https://github.com/Kabuda-czh/koishi-plugin-kbot/commit/42d6cfe16a7e0f0314003b423d0f1aef6a1e887e)

## Bug Fix
- 修复 \`bilibili\` 因手机端接口异常问题导致 \`code 799\` 查询不到用户 [a97be59](https://github.com/Kabuda-czh/koishi-plugin-kbot/commit/a97be595c8c77cca62bde8f99bab44dd70dff1e2)
- 修复 \`twitter\` 在搜索用户时请求返回 \`403\` 并未自动获取 \`token\` 的问题 [3db24e8](https://github.com/Kabuda-czh/koishi-plugin-kbot/commit/3db24e81557e2f8fbeb0c5d2e30baefc66d3804c)
- 修复 \`guildmanage\` 选择群时, 翻页还有自动选择的问题 [1be00aa](https://github.com/Kabuda-czh/koishi-plugin-kbot/commit/1be00aaa1e6d3af75b43395918b3ec5bfcb6ee6b)
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
