/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:28:53
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2024-05-24 11:31:57
 * @FilePath: \kbot-app-new\external\kbot\src\index.ts
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

import GeneratePath from './config'
import { downloadAndMoveFiles } from './plugins/utils'

export const name = 'kbot'

export const usage = `
<style>
html, body {
  width: 100%;
  height: 100%;
  display: flex;
  background: #000;
}
svg {
  width: 100%;
  height: 100px;
  margin: auto;
}
svg text {
  text-transform: uppercase;
  animation: stroke 5s infinite alternate;
  letter-spacing: 10px;
  font-size: 90px;
}
@keyframes stroke {
  0% {
    fill: rgba(72, 138, 20, 0);
    stroke: rgba(54, 95, 160, 1);
    stroke-dashoffset: 25%;
    stroke-dasharray: 0 50%;
    stroke-width: 0.8;
  }
  50% {
    fill: rgba(72, 138, 20, 0);
    stroke: rgba(54, 95, 160, 1);
    stroke-width: 1.2;
  }
  70% {
    fill: rgba(72, 138, 20, 0);
    stroke: rgba(54, 95, 160, 1);
    stroke-width: 1.5;
  }
  90%,
  100% {
    fill: rgba(72, 138, 204, 1);
    stroke: rgba(54, 95, 160, 0);
    stroke-dashoffset: -25%;
    stroke-dasharray: 50% 0;
    stroke-width: 0;
  }
}

</style>
<svg viewBox="400 0 400 200">
  <text x="0" y="70%"> Koishi-Plugin-KBot </text>
</svg>

# KBot v1.1.2 更新日志

## Note

- 修复 \`guildmanage\` 插件问题
- 修复 \`bilibili\` 插件问题
- 修复 \`twitter\` 插件问题
- 重构文件路径方法
- 更新 \`download\` 的路径下载
- 更新插件首页显示小动画, 以及部分内容

## Bug Fix

- 修复 \`guildmanage\` 因为 ref 绑定错误导致对应按钮无法打开
- 修复 \`guildmanage\` 监听 \`message\` 问题
- 修复文件路径, 使用单例模式来创建对应路径, 以及增加判断 \`kbot\` 文件夹
- 修复 \`bilibili\` 增加在 \`pptr\` 中, 跳转到网页后使用自带 \`cookie\` 的功能
- 修复 \`bilibili\` 对于 \`vup\` 以及 \`danmu\` 功能, 在关闭图片功能中, 无法正确使用的情况, 增加了单独使用图片的方法
- 在 \`bilibili\` 中, 增加 \`try-catch\` 对于渲染动态的报错捕获

## Feature

- 更改 \`download\` 文件下载的对应文件路径包
- 更新插件配置页面的小动画以及部分内容

详细更新日志请看: [Release](https://github.com/Kabuda-czh/koishi-plugin-kbot/releases/tag/1.1.2)

## 如果你觉得这个插件还不错, 可以考虑支持一下我
## [爱发电](https://afdian.net/a/kbd-dev)
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
    const generatePath = GeneratePath.getInstance(ctx.baseDir)
    const { kbotDir } = generatePath.getGeneratePathData()

    let createFlag = false
    try {
      await fs.promises.readdir(kbotDir)
    }
    catch (e) {
      logger.error('未找到 kbot-data 文件夹, 正在创建')
      await fs.promises.mkdir(kbotDir)
      createFlag = true
    }

    if (!createFlag && !fs.existsSync(kbotDir))
      await fs.promises.mkdir(kbotDir)

    const fontPath = await downloadAndMoveFiles('task1', 'kbot-fonts', [
      'npm://koishi-plugin-kbot-assets',
      'npm://koishi-plugin-kbot-assets?registry=https://registry.npmmirror.com',
    ], ctx)

    generatePath.setFontsDir(fontPath)

    const imagePath = await downloadAndMoveFiles('task2', 'kbot-images', [
      'npm://koishi-plugin-kbot-assets',
      'npm://koishi-plugin-kbot-assets?registry=https://registry.npm.taobao.org',
    ], ctx)

    generatePath.setImagesDir(imagePath)

    ctx.bots.forEach(async (bot) => {
      if (
        //@ts-ignore
        // TODO: 需要修复
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
