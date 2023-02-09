/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-03 13:57:11
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-09 18:06:07
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\bilibili\dynamic\dynamic.strategy.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { Argv, Channel, Context, Dict } from "koishi";
import { Config, logger } from ".";
import { DynamicNotifiction } from "../model";
import { uidExtract } from "../utils";
import {
  bilibiliAdd,
  bilibiliSearch,
  bilibiliList,
  bilibiliRemove,
} from "./common";
import {
  bilibiliVupCheck,
  bilibiliDanmuCheck,
  bilibiliRefreshVup,
  bilibiliCookie,
} from "./composition";

const dynamicStrategies = {
  add: bilibiliAdd,
  remove: bilibiliRemove,
  list: bilibiliList,
  search: bilibiliSearch,
  // TODO 等待增加查成分
  vup: bilibiliVupCheck,
  danmu: bilibiliDanmuCheck,
  refresh: bilibiliRefreshVup,
  cookie: bilibiliCookie
};

export const dynamicStrategy = async (
  {
    session,
    options,
  }: Argv<never, "id" | "guildId" | "platform" | "bilibili", any, any>,
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
    const value = options[strategyName];
    const uid = await uidExtract(value, { session }, logger, ctx);
    if (!["list", "cookie"].includes(strategyName) && !uid) return "未找到该 up, 请输入正确的 up 名 , up uid 或 up 首页链接";
    return dynamicStrategies[strategyName]?.(
      { session, options },
      uid,
      list,
      ctx,
      config
    );
  }
};
