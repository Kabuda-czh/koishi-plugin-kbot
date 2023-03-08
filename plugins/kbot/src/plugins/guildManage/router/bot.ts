/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-01 10:36:37
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-01 17:17:53
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\guildManage\router\bot.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import type { Context } from 'koishi'
import type { IRouterStrategy, UserInfo } from '../typings'
import handleFunction from '../utils'

export const botRoutes: IRouterStrategy = {
  '/self': function (context: Context) {
    return handleFunction<UserInfo>(context, 'getSelf')
  },
  '/sendMessage': function (context: Context) {
    return handleFunction(context, 'sendMessage', 'guildId', 'message', '')
  },
  '/broadcast': function (context: Context) {
    return handleFunction(context, 'broadcast', 'channels', 'message', 'delay')
  },
}
