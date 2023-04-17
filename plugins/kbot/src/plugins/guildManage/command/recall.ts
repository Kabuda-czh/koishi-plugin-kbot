/*
 * @Author: Kabuda-czh
 * @Date: 2023-04-17 11:20:08
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-04-17 14:25:48
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\guildManage\command\recall.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import type { Context } from 'koishi'
import { pick } from 'koishi'
import { RoleNumber } from './enum'
import { getGroupMemberRole } from './util'

export async function initRecall(context: Context) {
  context
    .command('kbot/guildManage.recall <user:user>', '批量撤回成员信息 默认1条',
      {
        checkArgCount: true,
        authority: 4,
      })
    .alias('批量撤回')
    .option('count', '-c <count:number> 指定撤回条数, 需要大于等于1', { fallback: 1, type: /^[1-9]\d*$/ })
    .usage('注意: 机器人权限至少为管理员且无法撤回管理员消息')
    .example('guildManage.recall @qq -c 2')
    .example('批量撤回 @qq')
    .action(async ({ session, options }, user) => {
      const count = Math.max(+options.count, 1)
      const userId = user.split(':')[1]
      const botRole = await getGroupMemberRole(session.bot, session.guildId, session.selfId)
      const qqRole = await getGroupMemberRole(session.bot, session.guildId, userId)
      if (RoleNumber[botRole] > RoleNumber[qqRole]) {
        const messageList = await context.database
          .select('chat.message')
          .where(
            pick({
              platform: session.platform,
              guildId: session.guildId,
              channelId: session.channelId,
              userId,
            }),
          )
          .orderBy('id', 'desc')
          .limit(count)
          .execute()

        messageList.filter(message => message.deleted !== 1)
          .map(async (message) => {
            await session.bot.internal.deleteMsg(message.messageId)
          })
      }
      else { return '机器人权限不足' }
    })
}
