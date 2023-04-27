/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-01 10:36:34
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-03-16 16:34:35
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\guildManage\router\index.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import type { IRouterStrategy } from '../typings'
import { botRoutes } from './bot'
import { commandRoutes } from './commands'
import { groupRoutes } from './group'
import { guildRoutes } from './guild'
import { muteRoutes } from './mute'

export const routerStrategies: IRouterStrategy = {
  ...botRoutes,
  ...guildRoutes,
  ...groupRoutes,
  ...muteRoutes,
  ...commandRoutes,
}
