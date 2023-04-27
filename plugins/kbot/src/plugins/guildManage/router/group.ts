/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-01 10:36:37
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-03-28 14:33:07
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\guildManage\router\group.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import type { Context } from 'koishi'
import type { IRouterStrategy } from '../typings'
import handleFunction from '../utils'

export const groupRoutes: IRouterStrategy = {
  '/groupList': function (context: Context) {
    return handleFunction(context, 'internal.getGroupList', 'botId', 'noCache')
  },
  '/groupMemberInfo': function (context: Context) {
    return handleFunction(context, 'internal.getGroupMemberInfo', 'botId', 'groupId', 'userId', 'noCache')
  },
  '/groupMemberList': function (context: Context) {
    return handleFunction(context, 'internal.getGroupMemberList', 'botId', 'groupId', 'noCache')
  },
  '/groupLeave': function (context: Context) {
    return handleFunction(context, 'internal.setGroupLeave', 'botId', 'groupId', 'isDismiss')
  },
  '/groupKick': function (context: Context) {
    return handleFunction(context, 'internal.setGroupKick', 'botId', 'groupId', 'userId', 'rejectAddRequest')
  },
  '/groupAdmin': function (context: Context) {
    return handleFunction(context, 'internal.setGroupAdmin', 'botId', 'groupId', 'userId', 'enable')
  },
}
