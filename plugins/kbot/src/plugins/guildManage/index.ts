/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-30 12:09:42
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-04-04 22:39:47
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\guildManage\index.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { resolve } from 'node:path'
import { Logger, Schema, pick } from 'koishi'
import type { Argv, Bot, Context } from 'koishi'
import { } from '@koishijs/plugin-console'
import {} from 'koishi-plugin-messages'
import { routerStrategies } from './router'
import type { GroupMemberInfo } from './typings'

declare module 'koishi' {
  namespace Command {
    interface Config {
      disabled?: boolean
    }
  }

  interface Channel {
    disable: string[]
  }
}

export interface IConfig { }

export const Config: Schema<IConfig> = Schema.object({})

export const logger = new Logger('kbot-plugin-guildManage')

enum RoleNumber {
  owner = 3,
  admin = 2,
  member = 1,
}

async function getGroupMemberRole(bot: Bot, groupId: string, userId: string) {
  const res: GroupMemberInfo = await bot.internal.getGroupMemberInfo(groupId, userId)
  return res.role
}

export function apply(context: Context) {
  context.model.extend('channel', {
    disable: 'list',
  })

  context.command('kbot/guildManage', '群管理指令')

  // TODO 优化 switch 变为 filter -> 解决中间件无法屏蔽的问题
  context.before('attach-channel', (session, fields) => {
    if (!session.argv)
      return fields.add('disable')
  })

  // check channel
  context.before('command/execute', async ({ session, command }: Argv<never, 'disable'>) => {
    return await session.observeChannel(['disable']).then((channel) => {
      const { disable = [] } = channel || {}
      while (command) {
        if (disable.includes(command.name))
          return ''
        command = command.parent as any
      }
    })
  })

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

  // TODO 全局黑名单

  Object.keys(routerStrategies).forEach((key) => {
    context.router.get(key, routerStrategies[key](context))
  })

  context.using(['console'], (ctx) => {
    ctx.console.addEntry({
      dev: resolve(__dirname, '../../../client/index.ts'),
      prod: resolve(__dirname, '../../../dist'),
    })
  })
}
