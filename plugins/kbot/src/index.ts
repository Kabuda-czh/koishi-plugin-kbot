/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:28:53
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-03-09 14:33:05
 * @FilePath: \KBot-App\plugins\kbot\src\index.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import * as fs from 'node:fs'
import { resolve } from 'node:path'
import type { Context } from 'koishi'
import { Logger, Schema } from 'koishi'

import * as botBasic from './basic'

import * as bilibiliPlugin from './plugins/bilibili'
import * as musicPlugin from './plugins/music'
import * as youtubePlugin from './plugins/youtube'
import * as managePlugin from './plugins/guildManage'
import * as twitterPlugin from './plugins/twitter'
import * as tarotPlugin from './plugins/tarot'

export const name = 'kbot'

export const usage = `
# 注意事项
内置多个插件，可在配置文件中配置启用插件\n
但注意，插件的配置项不是所有都是可选的，具体请查看插件的配置项
## 插件列表
<details>

<summary>详情</summary>

**KBotBasic**: 基础功能;

**KBotManage**: 群管理功能;

**KBotBilibili**: Bilibili 动态推送;

**KBotMusic**: 点歌功能;

**KBotYoutube**: Youtube 视频解析;

**KBotTwitter**: Twitter 动态推送;

**KBotTarot**: 塔罗牌占卜;

</details>

## 权限问题
- 第一步: 设置机器人的超级管理员 QQ 号, 建议为自身 QQ 号, kbot 会自动创建该账号最高权限, 注意设置完毕后需要重启一次\n
\t若指令仍然提示权限不足, 请通过在左侧菜单栏中找到 \`数据库\` 选项点击进入\n
\t然后找到 \`user\` 表, 在右侧中找到自己的账号(如果没有先与机器人私聊一次)\n
\t最后双击 \`authority\` 格, 更改自己的权限并保存
- 第二步: 由于插件的权限问题，需要启用 koishi 内置的权限插件 \`Admin\`\n
\t并通过 \`authorize <value> -u <user>\` 指令来授权其他用户\n
\t详情请看链接 [authorize](https://koishi.chat/plugins/common/admin.html#%E6%8C%87%E4%BB%A4-authorize)
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

export const using = ['console', 'database', 'puppeteer'] as const

export async function apply(ctx: Context, config: IConfig) {
  if (!config.superAdminQQ || config.superAdminQQ.length === 0) {
    logger.error('未设置超级管理员QQ号')
  }
  else {
    const fileNames = fs.readdirSync(resolve(__dirname, '../../../public'))

    if (!fileNames.includes('kbot'))
      fs.mkdirSync(resolve(__dirname, '../../../public/kbot'))

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
    if (config.KBotTwitter.enabled) {
      if (ctx.puppeteer)
        ctx.plugin(twitterPlugin, config.KBotTwitter)
      else logger.warn('未启用 puppeteer, Twitter 动态推送功能将不可用')
    }
    if (config.KBotTarot.enabled)
      ctx.plugin(tarotPlugin, config.KBotTarot)

    logger.success('KBot 内置插件加载完毕')
  }
}
