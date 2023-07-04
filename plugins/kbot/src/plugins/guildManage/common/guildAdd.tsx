/*
 * @Author: Kabuda-czh
 * @Date: 2023-06-27 18:51:06
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-07-04 12:57:58
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\guildManage\common\guildAdd.tsx
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import type { Context } from 'koishi'
import { sleep } from 'koishi'
import { getGroupMemberRole } from '../utils'

interface IValidList {
  id: number
  guildId: string
  validObject: any
  timer: number
}

declare module 'koishi' {
  interface Tables {
    'guildmanage.addValid': IValidList
  }
}

export async function initGuildAdd(context: Context) {
  context.database.extend('guildmanage.addValid', {
    id: 'unsigned',
    guildId: 'string',
    validObject: {
      type: 'json',
      initial: {},
    },
    timer: {
      type: 'integer',
      initial: 60,
    },
  }, {
    autoInc: true,
  })

  context.guild().on('guild-added', async (session) => {
    const { userId, guildId } = session
    const botRole = await getGroupMemberRole(session.bot, guildId, session.selfId)
    const validRes = await context.database.get('guildmanage.addValid', { guildId })
    if (botRole === 'member')
      return

    if (!validRes.length || !Object.keys(validRes[0].validObject).length)
      return

    const { validObject, timer } = validRes[0]

    const randomQuestion = Object.keys(validObject)[Math.floor(Math.random() * Object.keys(validObject).length)]

    await session.send(
        <message>
          <at id={userId} />
          <p>欢迎加入本群</p>
          <p>请在 {timer || 60} 秒内回答下面的问题</p>
          <p>{randomQuestion}</p>
          <p>如果回答错误, 将会被移出本群</p>
        </message>,
    )

    const input = await session.prompt((timer || 60) * 1000)

    if (input !== validObject[randomQuestion]) {
      await session.send(
          <message>
            <at id={userId} />
            <p>回答错误, 3 秒后将踢出本群</p>
          </message>,
      )
      await sleep(3000)
      await session.bot.kickGuildMember(guildId, userId)
    }
    else {
      await session.send(
          <message>
            <at id={userId} />
            <p>回答正确, 欢迎加入本群</p>
          </message>,
      )
    }
  })
}
