/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-01 10:36:34
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-07-04 11:33:03
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\guildManage\router\index.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import type { IRouterStrategy } from '../typings'
import { botRoutes } from './bot'
import { commandRoutes } from './commands'
import { commonRoutes } from './common'
import { groupRoutes } from './group'
import { guildRoutes } from './guild'
import { imageRoutes } from './image'
import { muteRoutes } from './mute'

export const routerStrategies: IRouterStrategy = {
  ...botRoutes,
  ...guildRoutes,
  ...groupRoutes,
  ...muteRoutes,
  ...commandRoutes,
  ...imageRoutes,
  ...commonRoutes,
}
