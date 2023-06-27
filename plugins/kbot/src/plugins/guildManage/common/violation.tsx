/*
 * @Author: Kabuda-czh
 * @Date: 2023-06-27 18:51:02
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-06-27 19:18:04
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\guildManage\common\violation.tsx
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import type { Context } from 'koishi'
import type { IConfig } from '..'
import { RoleNumber } from '../enum'
import { getGroupMemberRole } from '../utils'

interface IViolationList {
  id: number
  userId: string
  userCount: number
  day: number
}

declare module 'koishi' {
  interface Tables {
    'guild.violationList': IViolationList
  }
}

export async function initViolation(context: Context, config: IConfig) {
  context.database.extend('guild.violationList', {
    id: 'unsigned',
    userId: 'string',
    userCount: 'integer(3)',
    day: 'integer(2)',
  })

  if (config.monitorSpeech?.enabled) {
    context.guild().on('message', async (session) => {
      const { userId, guildId, content } = session

      const botRole = await getGroupMemberRole(session.bot, guildId, session.selfId)
      const userRole = await getGroupMemberRole(session.bot, guildId, userId)

      const userRes = await context.database.get('guild.violationList', { userId })
      const { id, day } = userRes[0]
      let { userCount } = userRes[0]
      let isViolation = false

      if (botRole === 'member' || RoleNumber[userRole] >= RoleNumber[botRole])
        return

      const { violations = [], count = 3, handleWay = 'mute' } = config.monitorSpeech

      for (const violation of violations) {
        if (content.includes(violation)) {
          if (userRes.length) {
            if (day === new Date().getDay()) {
              if (userCount + 1 < count) {
                await context.database.upsert('guild.violationList', [{
                  id,
                  userCount: userCount + 1,
                }])
              }
            }
            else {
              await context.database.upsert('guild.violationList', [{
                id,
                userCount: 1,
                day: new Date().getDay(),
              }])
            }
          }
          else {
            await context.database.upsert('guild.violationList', [{
              userId,
              userCount: 1,
              day: new Date().getDay(),
            }])
          }
          userCount = userCount || 0 + 1
          isViolation = true
          break
        }
      }

      if (isViolation) {
        await session.bot.deleteMessage(guildId, session.messageId)
        await session.send(<message>
          <at id={userId} />
          <p>因为违规发言, 已被撤回</p>
        </message>)
      }
      if (userCount < count)
        return

      if (handleWay === 'mute') {
        await session.send(
          <message>
            <at id={userId} />
            <p>因为违规发言, 已被禁言 1 天</p>
          </message>,
        )
        await session.bot.muteGuildMember(guildId, userId, 60 * 60 * 24 * 1)
      }
      else if (handleWay === 'kick') {
        await session.send(
          <message>
            <at id={userId} />
            <p>因为违规发言, 已被踢出本群</p>
          </message>,
        )
        await session.bot.kickGuildMember(guildId, userId)
      }
    })
  }
}
