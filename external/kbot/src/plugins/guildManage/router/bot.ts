/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-01 10:36:37
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2024-05-24 11:34:04
 * @FilePath: \kbot-app-new\external\kbot\src\plugins\guildManage\router\bot.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import type { Context } from 'koishi'
import type { Context as KoaContext } from 'koa'
import type { IRouterStrategy } from '../typings'
import handleFunction from '../utils'

function getBots(context: Context) {
  return async (ctx: KoaContext) => {
    //@ts-ignore
    // TODO: 需要修复
    const bots = context.bots.filter(bot => bot.platform === 'onebot' && bot.status === 'online')
    ctx.body = bots.map((bot) => {
      return {
        userId: bot.selfId,
        //@ts-ignore
        // TODO: 需要修复
        avatar: bot.avatar,
        //@ts-ignore
        // TODO: 需要修复
        nickname: bot.username,
      }
    })
  }
}

export const botRoutes: IRouterStrategy = {
  '/bots': function (context: Context) {
    return getBots(context)
  },
  '/sendMessage': function (context: Context) {
    return handleFunction(context, 'sendMessage', 'botId', 'guildId', 'message', '')
  },
  '/broadcast': function (context: Context) {
    return handleFunction(context, 'broadcast', 'botId', 'channels', 'message', 'delay')
  },
}
