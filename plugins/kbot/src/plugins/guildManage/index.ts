/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-30 12:09:42
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-01 10:34:42
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\guildManage\index.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { resolve } from 'node:path'
import type { Context } from 'koishi'
import { Schema } from 'koishi'
import {} from '@koishijs/plugin-console'
import { routerStrategies } from './router'

export interface IConfig {}

export const Config: Schema<IConfig> = Schema.object({})

export function apply(context: Context) {
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
