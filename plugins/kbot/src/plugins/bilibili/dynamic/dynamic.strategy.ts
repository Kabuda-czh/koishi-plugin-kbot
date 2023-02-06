/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-03 13:57:11
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-03 17:54:20
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\bilibili\dynamic\dynamic.strategy.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { Argv, Channel, Context, Dict } from "koishi";
import { Config } from ".";
import { DynamicNotifiction } from "../model";
import { bilibiliAdd, bilibiliCheck, bilibiliList, bilibiliRemove } from "./common";

const dynamicStrategies = {
  add: bilibiliAdd,
  remove: bilibiliRemove,
  list: bilibiliList,
  check: bilibiliCheck
};

export const dynamicStrategy = (
  { session, options }: Argv<never, "id" | "guildId" | "platform" | "bilibili", any, any>,
  list: Dict<
    [
      Pick<Channel, "id" | "guildId" | "platform" | "bilibili">,
      DynamicNotifiction
    ][]
  >,
  ctx: Context,
  config: Config
) => {
  const strategyName = Object.keys(options).find((key) => options[key]);
  if (strategyName) {
    return dynamicStrategies[strategyName]({ session, options }, list, ctx, config);
  }
};