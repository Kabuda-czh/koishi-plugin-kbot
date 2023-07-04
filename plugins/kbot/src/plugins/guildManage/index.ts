/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-30 12:09:42
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-06-28 17:23:56
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
import { initCommon } from './common'

declare module 'koishi' {
  interface Channel {
    disable: string[]
    watchDelete: boolean
  }
}

export interface IConfig {
  monitorSpeech?: {
    enabled: boolean
    violations?: string[]
    count?: number
    handleWay?: 'mute' | 'kick'
  }
  monitorGuildAdd?: {
    enabled: boolean
    timer?: number
    questions?: Record<string, string>
  }
}

export const Config: Schema<IConfig> = Schema.object({
  // monitorSpeech: Schema.intersect([
  //   Schema.object({
  //     enabled: Schema.boolean().default(false).description('是否开启群发言监控'),
  //   }),
  //   Schema.union([
  //     Schema.object({
  //       enabled: Schema.const(true).required(),
  //       violations: Schema.union([
  //         Schema.array(String),
  //         Schema.transform(String, value => [value]),
  //       ]).default([]).description('违规词语列表'),
  //       count: Schema.number().min(1).max(999).default(3).description('每天违规次数'),
  //       handleWay: Schema.union([
  //         Schema.const('mute').description('禁言'),
  //         Schema.const('kick').description('踢出群聊'),
  //       ]).role('radio').default('mute').description('违规处理方式'),
  //     }),
  //     Schema.object({
  //       enabled: Schema.const(false),
  //     }),
  //   ]),
  // ]),
  // monitorGuildAdd: Schema.intersect([
  //   Schema.object({
  //     enabled: Schema.boolean().default(false).description('是否开启群入群监控'),
  //   }),
  //   Schema.union([
  //     Schema.object({
  //       enabled: Schema.const(true).required(),
  //       timer: Schema.number().default(60).description('入群问答超时时间(秒)'),
  //       questions: Schema.dict(String).role('table').required().description('入群问答 (左边 key 为 问题, 右边 value 为 答案)'),
  //     }),
  //     Schema.object({
  //       enabled: Schema.const(false),
  //     }),
  //   ]),
  // ]),
})

export const logger = new Logger('kbot-plugin-guildManage')

export function apply(context: Context, config: IConfig) {
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

  initCommon(context, config)

  initCommand(context)

  Object.keys(routerStrategies).forEach((key) => {
    context.router.all(key, routerStrategies[key](context))
  })

  context.using(['console'], (ctx) => {
    ctx.console.addEntry({
      dev: resolve(__dirname, '../../../client/index.ts'),
      prod: resolve(__dirname, '../../../dist'),
    })
  })
}
