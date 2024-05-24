/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-02 17:18:14
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-05-23 10:34:14
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\valorant\index.tsx
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import type { Context } from 'koishi'
import { Logger, Schema } from 'koishi'
import Auth from './auth'

export interface IConfig { }

export const Config: Schema<IConfig> = Schema.object({})

export const logger = new Logger('KBot-plugin-valorant')

export function apply(ctx: Context, config: IConfig) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
  ctx.i18n.define('zh', require('./locales/zh-CN'))

  const auth = new Auth(ctx.http)
}
