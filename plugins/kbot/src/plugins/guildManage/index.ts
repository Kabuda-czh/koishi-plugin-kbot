/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-30 12:09:42
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-05-15 11:29:29
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\guildManage\index.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
*/
import { resolve } from 'node:path'
import { Logger, Schema } from 'koishi'
import type { Argv, Context } from 'koishi'
import { } from '@koishijs/plugin-console'
import { routerStrategies } from './router'
import { initCommand } from './command'

declare module 'koishi' {
  interface Channel {
    disable: string[]
    watchDelete: boolean
  }
}

export interface IConfig { }

export const Config: Schema<IConfig> = Schema.object({})

export const logger = new Logger('kbot-plugin-guildManage')

export function apply(context: Context) {
  context.model.extend('channel', {
    disable: 'list',
    watchDelete: 'boolean',
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

  // 监听群撤回消息
  // TODO 因 messages 插件暂时无法正确使用, 所以暂时无法监听群撤回消息
  // context.guild().on('message-deleted', async (session) => {

  // })

  initCommand(context)

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
