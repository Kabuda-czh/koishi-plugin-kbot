/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-01 10:36:37
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-05-15 11:05:56
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\guildManage\router\guild.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import type { Context, Universal } from 'koishi'
import type { Context as KoaContext } from 'koa'
import type { GuildMemberInfo, IRouterStrategy } from '../typings'
import handleFunction from '../utils'

function getGuildWatchList(context: Context) {
  return async (ctx: KoaContext) => {
    const channelInfo = await context.database.get('channel', { platform: 'onebot' })
    ctx.body = channelInfo.map((channel) => {
      return {
        guildId: +channel.guildId,
        isWatch: channel.watchDelete,
      }
    })
  }
}

function getSetGuildWatch(context: Context) {
  return async (ctx: KoaContext) => {
    const { guildId, isWatch } = ctx.query
    const channel = await context.database.get('channel', { id: guildId, platform: 'onebot', guildId })
    if (channel.length === 0) {
      ctx.body = false
    }
    else {
      await context.database.upsert('channel', [{ id: guildId as string, platform: 'onebot', guildId: guildId as string, watchDelete: +(isWatch as string) === 1 }])
      ctx.body = true
    }
  }
}

export const guildRoutes: IRouterStrategy = {
  '/setGuildWatch': function (context: Context) {
    return getSetGuildWatch(context)
  },
  '/guildWatchList': function (context: Context) {
    return getGuildWatchList(context)
  },
  '/guildList': function (context: Context) {
    return handleFunction<Universal.Guild>(context, 'getGuildList', 'botId')
  },
  '/guildMemberList': function (context: Context) {
    return handleFunction<GuildMemberInfo>(context, 'getGuildMemberList', 'botId', 'guildId')
  },
}
