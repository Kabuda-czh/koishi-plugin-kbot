/*
 * @Author: Kabuda-czh
 * @Date: 2023-06-27 18:51:06
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-06-27 18:54:17
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\guildManage\common\guildAdd.tsx
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import type { Context } from 'koishi'
import { sleep } from 'koishi'
import type { IConfig } from '..'
import { getGroupMemberRole } from '../utils'

export async function initGuildAdd(context: Context, config: IConfig) {
  if (config.monitorGuildAdd?.enabled) {
    context.guild().on('guild-added', async (session) => {
      const { userId, guildId } = session
      const botRole = await getGroupMemberRole(session.bot, guildId, session.selfId)
      if (botRole === 'member')
        return

      if (!Object.keys(config.monitorGuildAdd?.questions || {}).length)
        return

      const randomQuestion = Object.keys(config.monitorGuildAdd.questions)[Math.floor(Math.random() * Object.keys(config.monitorGuildAdd.questions).length)]

      await session.send(
        <message>
          <at id={userId} />
          <p>欢迎加入本群</p>
          <p>请在 {config.monitorGuildAdd?.timer || 60} 秒内回答下面的问题</p>
          <p>{randomQuestion}</p>
          <p>如果回答错误, 将会被移出本群</p>
        </message>,
      )

      const input = await session.prompt((config.monitorGuildAdd?.timer || 60) * 1000)

      if (input !== config.monitorGuildAdd.questions[randomQuestion]) {
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
}
