/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-30 12:09:42
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-03-09 16:59:29
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

declare module 'koishi' {
  namespace Command {
    interface Config {
      disabled?: boolean
    }
  }

  interface Channel {
    enable: string[]
    disable: string[]
  }
}

export interface IConfig { }

export const Config: Schema<IConfig> = Schema.object({})

export const logger = new Logger('kbot-plugin-guildManage')

export function apply(context: Context) {
  context.model.extend('channel', {
    disable: 'list',
  })

  context.before('attach-channel', (session, fields) => {
    if (!session.argv)
      return fields.add('disable')
  })

  // check channel
  context.before('command/execute', ({ session, command }: Argv<never, 'enable' | 'disable'>) => {
    const { enable = [], disable = [] } = session.channel || {}
    while (command) {
      if (command.config.disabled) {
        if (enable.includes(command.name))
          return null
        return ''
      }
      else {
        if (disable.includes(command.name))
          return ''
        command = command.parent as any
      }
    }
  })

  context.router.get('/commands', async (ctx) => {
    // ctx.body = [...context.$commander._commands.keys()].filter(key => !key.includes('.'))
    ctx.body = [...context.$commander._commands.keys()]
  })

  context.router.get('/switchCommands', async (ctx) => {
    logger.info(ctx.query)
    ctx.body = ctx.query
  })

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
