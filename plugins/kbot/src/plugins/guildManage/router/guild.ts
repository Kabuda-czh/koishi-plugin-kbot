/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-01 10:36:37
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-02 11:29:37
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\guildManage\router\guild.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import type { Context, Universal } from 'koishi'
import type { GuildMemberInfo, IRouterStrategy } from '../typings'
import handleFunction from '../utils'

export const guildRoutes: IRouterStrategy = {
  '/guildList': function (context: Context) {
    return handleFunction<Universal.Guild>(context, 'getGuildList', 'botId')
  },
  '/guildMemberList': function (context: Context) {
    return handleFunction<GuildMemberInfo>(context, 'getGuildMemberList', 'botId', 'guildId')
  },
}
