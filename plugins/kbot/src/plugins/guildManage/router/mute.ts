/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-01 10:36:42
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-03-09 15:24:42
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\guildManage\router\mute.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import type { Context } from 'koishi'
import type { IRouterStrategy } from '../typings'
import handleFunction from '../utils'

export const muteRoutes: IRouterStrategy = {
  '/muteGuild': function (context: Context) {
    return handleFunction(context, 'muteChannel', 'guildId', '', 'mute')
  },
  '/muteMember': function (context: Context) {
    return handleFunction(context, 'muteGuildMember', 'guildId', 'userId', 'duration')
  },
}
