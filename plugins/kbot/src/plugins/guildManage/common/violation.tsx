/*
 * @Author: Kabuda-czh
 * @Date: 2023-06-27 18:51:02
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-07-20 14:58:25
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\guildManage\common\violation.tsx
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import type { Context } from 'koishi'
import { RoleNumber } from '../enum'
import { getGroupMemberRole } from '../utils'

interface IViolationList {
  id: number
  guildId: string
  violations: string[]
  count: number
  handleWay: 'mute' | 'kick'
}

interface IUserViolation {
  id: number
  userId: string
  userCount: number
  day: number
}

declare module 'koishi' {
  interface Tables {
    'guildmanage.violationList': IViolationList
    'guildmanage.userViolation': IUserViolation
  }
}

export async function initViolation(context: Context) {
  context.database.extend('guildmanage.violationList', {
    id: 'unsigned',
    guildId: 'string',
    violations: {
      type: 'list',
      initial: [],
    },
    count: {
      type: 'integer',
      initial: 3,
    },
    handleWay: {
      type: 'string',
      initial: 'mute',
    },
  }, {
    autoInc: true,
  })

  context.database.extend('guildmanage.userViolation', {
    id: 'unsigned',
    userId: 'string',
    userCount: 'integer(3)',
    day: 'integer(2)',
  }, {
    autoInc: true,
  })

  context.guild().middleware(async (session, next) => {
    const { userId, guildId, content } = session

    let userRes = await context.database.get('guildmanage.userViolation', { userId })
    const violationRes = await context.database.get('guildmanage.violationList', { guildId })

    if (violationRes.length === 0)
      return next()

    if (userRes.length === 0) {
      await context.database.upsert('guildmanage.userViolation', [{
        userId,
        userCount: 0,
        day: new Date().getDate(),
      }])

      userRes = await context.database.get('guildmanage.userViolation', { userId })
    }

    const botRole = await getGroupMemberRole(session.bot, guildId, session.selfId)
    const userRole = await getGroupMemberRole(session.bot, guildId, userId)

    const { id, day } = userRes[0]
    let { userCount } = userRes[0]
    let isViolation = false

    if (botRole === 'member' || RoleNumber[userRole] >= RoleNumber[botRole])
      return next()

    const { violations = [], count = 3, handleWay = 'mute' } = violationRes[0]

    for (const violation of violations) {
      if (content.includes(violation)) {
        if (userRes.length) {
          if (day === new Date().getDate()) {
            if (userCount + 1 < count) {
              await context.database.upsert('guildmanage.userViolation', [{
                id,
                userCount: userCount + 1,
              }])
            }
          }
          else {
            await context.database.upsert('guildmanage.userViolation', [{
              id,
              userCount: 1,
              day: new Date().getDate(),
            }])
          }
        }
        else {
          await context.database.upsert('guildmanage.userViolation', [{
            userId,
            userCount: 1,
            day: new Date().getDate(),
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
          <p>因为违规发言, 已被撤回, 今日违规次数 +1, 当前违规次数: {userCount}, 每日违规次数为: {count}</p>
        </message>)
    }
    if (userCount < count)
      return next()

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
    return next()
  }, true)
}
