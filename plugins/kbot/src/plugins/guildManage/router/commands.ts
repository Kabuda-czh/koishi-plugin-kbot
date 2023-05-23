/*
 * @Author: Kabuda-czh
 * @Date: 2023-03-16 16:24:21
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-05-15 10:16:22
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\guildManage\router\commands.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import type { Context } from 'koishi'
import type { Context as KoaContext } from 'koa'
import type { IRouterStrategy } from '../typings'
import { logger } from '..'

function getChildren(command: any) {
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

function commands(context: Context) {
  return async (ctx: KoaContext) => {
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
  }
}

function getDisabledCommands(context: Context) {
  return async (ctx: KoaContext) => {
    const { guildId } = ctx.query
    const channel = await context.database.get('channel', { id: guildId, platform: 'onebot', guildId })
    ctx.body = channel[0]?.disable || []
  }
}

function switchCommands(context: Context) {
  return async (ctx: KoaContext) => {
    const { guildId, commands } = ctx.query
    try {
      await context.database.upsert('channel', [{ id: guildId as string, platform: 'onebot', guildId: guildId as string, disable: commands }])
      ctx.body = true
    }
    catch (err) {
      logger.error(err)
      ctx.body = false
    }
  }
}

export const commandRoutes: IRouterStrategy = {
  '/commands': function (context: Context) {
    return commands(context)
  },
  '/disabledCommands': function (context: Context) {
    return getDisabledCommands(context)
  },
  '/switchCommands': function (context: Context) {
    return switchCommands(context)
  },
}
