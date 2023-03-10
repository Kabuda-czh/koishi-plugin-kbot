/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-30 12:09:42
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-03-10 18:22:14
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

const getChildren = (command: any) => {
  if (command.children.length === 0) {
    return []
  }
  else {
    return command.children.map((child: any) => {
      return {
        name: child.name,
        children: getChildren(child),
        parent: command.name,
        disable: false,
      }
    })
  }
}
export function apply(context: Context) {
  context.model.extend('channel', {
    disable: 'list',
  })

  context.before('attach-channel', (session, fields) => {
    if (!session.argv)
      return fields.add('disable')
  })

  // check channel
  context.before('command/execute', async ({ session, command }: Argv<never, 'enable' | 'disable'>) => {
    return await session.observeChannel(['disable']).then((channel) => {
      const { disable = [] } = channel || {}
      while (command) {
        if (disable.includes(command.name))
          return ''
        command = command.parent as any
      }
    })
  })

  context.router.get('/commands', async (ctx) => {
    const commandsObject = {}
    context.$commander._commands.forEach((command) => {
      if (!command.parent && !commandsObject[command.name]) {
        commandsObject[command.name] = {
          name: command.name,
          children: getChildren(command),
          parent: command.parent?.name ?? '',
          disable: false,
          hasChildren: command.children.length > 0,
        }
      }
    })

    // ctx.body = [...context.$commander._commands.keys()].filter(key => !key.includes('.'))
    ctx.body = commandsObject
  })

  context.router.get('/getDisabledCommands', async (ctx) => {
    const { guildId } = ctx.query
    const channel = await context.database.get('channel', { id: guildId, platform: 'onebot', guildId })
    ctx.body = channel[0]?.disable || []
  })

  context.router.get('/switchCommands', async (ctx) => {
    const { guildId, commands } = ctx.query
    try {
      await context.database.upsert('channel', [{ id: guildId as string, platform: 'onebot', guildId: guildId as string, disable: commands }])
      ctx.body = true
    }
    catch (err) {
      logger.error(err)
      ctx.body = false
    }
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
