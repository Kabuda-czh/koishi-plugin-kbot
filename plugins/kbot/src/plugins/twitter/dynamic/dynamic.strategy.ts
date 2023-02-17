/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-03 13:57:11
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-17 16:11:37
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\twitter\dynamic\dynamic.strategy.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { Argv, Channel, Context, Dict } from "koishi";
import { Config, logger } from ".";
import { DynamicNotifiction } from "../model";
import { getTwitterRestId } from "../utils";
import {
  twitterAdd,
  twitterSearch,
  twitterList,
  twitterRemove,
} from "./common";

const dynamicStrategies = {
  add: twitterAdd,
  remove: twitterRemove,
  list: twitterList,
  search: twitterSearch
};

export const dynamicStrategy = async (
  {
    session,
    options,
  }: Argv<never, "id" | "guildId" | "platform" | "twitter", any, any>,
  list: Dict<
    [
      Pick<Channel, "id" | "guildId" | "platform" | "twitter">,
      DynamicNotifiction
    ][]
  >,
  ctx: Context,
  config: Config
) => {
  const strategyName = Object.keys(options).find((key) => options[key]);
  if (strategyName) {
    const value = options[strategyName];
    const uid = await getTwitterRestId(value, ctx.http);
    console.log(uid);
    // if (!["list"].includes(strategyName) && !uid) return "未找到该 up, 请输入正确的 up 名 , up uid 或 up 首页链接";
    
    // return dynamicStrategies[strategyName]?.(
    //   { session, options },
    //   uid,
    //   list,
    //   ctx,
    //   config
    // );
  }
};
