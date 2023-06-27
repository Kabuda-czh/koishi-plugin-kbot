/*
 * @Author: Kabuda-czh
 * @Date: 2023-04-17 11:20:08
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-06-27 18:50:26
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\guildManage\command\recall.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import type { Context, Dict } from 'koishi'
import { Time, remove, sleep } from 'koishi'
import type { Message } from '../typings'
import { RoleNumber } from '../enum'
import { getGroupMemberRole } from '../utils'

export async function initRecall(context: Context) {
  const recent: Dict<string[]> = {}

  context.guild().on('send', (session) => {
    const list = recent[session.channelId] ||= []
    list.unshift(session.messageId)
    context.setTimeout(() => remove(list, session.messageId), Time.hour)
  })

  context
    .guild()
    .command('kbot/guildManage.recall <user:string>', '在 1 天时间内批量撤回成员信息 默认1条',
      {
        checkArgCount: true,
        authority: 3,
      })
    .alias('批量撤回')
    .option('count', '-c <count:number> 指定撤回条数, 需要大于等于1', { fallback: 1, type: /^[1-9]\d*$/ })
    .usage('注意: 机器人权限至少为管理员且无法撤回管理员消息')
    .example('guildManage.recall qq -c 2')
    .example('批量撤回 qq')
    .action(async ({ session, options }, user) => {
      const count = Math.max(+options.count, 1)
      const botRole = await getGroupMemberRole(session.bot, session.guildId, session.selfId)
      const qqRole = await getGroupMemberRole(session.bot, session.guildId, user)
      const delay = context.root.config?.delay?.broadcast || 500
      if (RoleNumber[botRole] > RoleNumber[qqRole]) {
        const messageList: Message[] = []

        const getHistoryMsg = async (length: number, messageId?: number) => {
          const history: { messages: Message[] } = await session.bot.internal.getGroupMsgHistory(session.channelId, messageId)
          if (!history.messages.length)
            return
          const msg = history.messages.filter(message => message.user_id === +user)
          if (msg.length)
            messageList.push(...msg.slice(0, length))
          messageList.sort((a, b) => b.time - a.time)
          return history.messages[0].time * 1000
        }

        while (messageList.length < count) {
          const lastTime = await getHistoryMsg(count - messageList.length, messageList[messageList.length - 1]?.message_id)
          if (!lastTime)
            break
          if (lastTime > Date.now() - Time.day)
            break
        }

        messageList.map(async (message) => {
          await session.bot.internal.deleteMsg(message.message_id)
          if (delay)
            await sleep(delay)
        })
      }
      else if (user === session.selfId) {
        const list = recent[session.channelId]
        if (!list)
          return '机器人近期没有发送消息'
        const removal = list.splice(0, count)
        if (!list.length)
          delete recent[session.channelId]
        for (let index = 0; index < removal.length; index++) {
          if (index && delay)
            await sleep(delay)
          await session.bot.internal.deleteMsg(removal[index])
        }
      }
      else { return '机器人权限不足' }
    })
}
