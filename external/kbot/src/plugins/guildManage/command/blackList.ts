/*
 * @Author: Kabuda-czh
 * @Date: 2023-04-17 11:22:03
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-06-27 18:49:43
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\guildManage\command\blackList.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import type { Context } from 'koishi'
import type { GroupInfo, GroupMemberInfo } from '../typings'
import { getGroupMemberRole } from '../utils'
import { RoleNumber } from '../enum'

interface IBlackList {
  id: number
  qq: string
  name: string
  time: number
  reason: string
}

declare module 'koishi' {
  interface Tables {
    'guild.blackList': IBlackList
  }
}

// 全局黑名单
export async function initBlackList(context: Context) {
  context.database.extend('guild.blackList', {
    id: 'unsigned',
    qq: 'string',
    name: 'string',
    time: 'integer',
    reason: 'string',
  }, {
    autoInc: true,
  })

  context.command('kbot/guildManage.blackList <qq:string>', '全局黑名单', {
    checkArgCount: true,
    authority: 4,
    showWarning: false,
  })
    .alias('全局拉黑')
    .option('reason', '-r <reason:string> 拉黑原因')
    .action(async ({ session, options }, qq) => {
      const { reason = '无' } = options
      const { user_id, nickname } = await session.bot.internal.getStrangerInfo(qq)
      const time = Date.now()
      await context.database.upsert('guild.blackList', [{ qq: user_id, name: nickname, time, reason }])
      return `已将 ${nickname}(${user_id}) 拉黑`
    })

  context.command('kbot/guildManage.checkblacklist', '复核全群黑名单', {
    checkArgCount: true,
    authority: 4,
    showWarning: false,
  })
    .alias('复核黑名单')
    .action(async ({ session }) => {
      const failMap: Record<string, (string | number)[]> = {}
      const successMap: Record<string, (string | number)[]> = {}

      const guildList: GroupInfo[] = await session.bot.internal.getGroupList()
      const blackList = new Set((await context.database.select('guild.blackList').execute()).map(black => black.qq))

      for (const guild of guildList) {
        const botRole = await getGroupMemberRole(session.bot, guild.group_id, session.selfId)
        if (RoleNumber[botRole] <= RoleNumber.member && botRole !== 'owner')
          continue

        const memberList: GroupMemberInfo[] = await session.bot.internal.getGroupMemberList(guild.group_id)

        for (const member of memberList) {
          if (!blackList.has(String(member.user_id)))
            continue
          if (['owner', 'admin'].includes(member.role)) {
            failMap[guild.group_id] = [...failMap[guild.group_id] || [], member.user_id]
            continue
          }
          await session.bot.internal.setGroupKick(guild.group_id, member.user_id).then(() => {
            successMap[guild.group_id] = [...successMap[guild.group_id] || [], member.user_id]
          }).catch(() => {
            failMap[guild.group_id] = [...failMap[guild.group_id] || [], member.user_id]
          })
        }
      }

      return `复核完成, 本次复核共 ${guildList.length} 个群
${Object.keys(successMap).length > 0 ? `成功在 ${Object.keys(successMap).length} 个群中移除 ${Object.values(successMap).reduce((a, b) => a + b.length, 0)} 个黑名单成员` : '并未有人被移除'}
${Object.keys(failMap).length > 0
? `一共失败 ${Object.keys(failMap).length} 个群
详细信息:
${Object.keys(failMap).map(guildId => `群号: ${guildId}, 失败成员: ${failMap[guildId].join(', ')}`).join('\n')}
请检查以上群是否有管理员或群主, 并手动移除黑名单成员`
: ''}`
    })
}
