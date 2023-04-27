/*
 * @Author: Kabuda-czh
 * @Date: 2023-04-17 14:24:50
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-04-17 14:47:02
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\guildManage\command\util.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import type { Bot } from 'koishi'
import type { GroupMemberInfo } from '../typings'

export async function getGroupMemberRole(bot: Bot, groupId: string | number, userId: string | number) {
  const res: GroupMemberInfo = await bot.internal.getGroupMemberInfo(groupId, userId)
  return res.role
}
