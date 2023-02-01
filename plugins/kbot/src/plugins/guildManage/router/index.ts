/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-01 10:36:34
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-01 11:32:11
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\guildManage\router\index.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { IRouterStrategy } from "../typings";
import { botRoutes } from "./bot";
import { guildRoutes } from "./guild";
import { muteRoutes } from "./mute";

export const routerStrategies: IRouterStrategy = {
  ...botRoutes,
  ...guildRoutes,
  ...muteRoutes
};