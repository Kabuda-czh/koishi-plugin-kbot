/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-03 13:57:11
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-27 13:32:59
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\twitter\dynamic\dynamic.strategy.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { Argv, Channel, Context, Dict } from "koishi";
import { Config, logger } from ".";
import { DynamicNotifiction } from "../model";
import { getTwitterRestId, getTwitterToken } from "../utils";
import {
  twitterAdd,
  twitterSearch,
  twitterList,
  twitterRemove,
} from "./common";
import * as fs from "fs";
import { resolve } from "path";

const dynamicStrategies = {
  add: twitterAdd,
  remove: twitterRemove,
  list: twitterList,
  search: twitterSearch,
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
  let cookie;
  try {
    cookie = JSON.parse(
      fs.readFileSync(
        resolve(__dirname, "../../../../../../public/kbot/twitter/cookie.json"),
        "utf-8"
      )
    );
    ctx.http.config.headers["x-guest-token"] = cookie.cookies;
  } catch (e) {
    cookie = await getTwitterToken(ctx);
  }

  const strategyName = Object.keys(options).find((key) => options[key]);
  if (strategyName) {
    const twitterId = options[strategyName];
    const [restId, twitterName] = await getTwitterRestId(
      twitterId,
      ctx.http,
      logger
    );
    if (!["list"].includes(strategyName) && !restId)
      return "未获取到对应 twitter 博主 ID 信息";

    return dynamicStrategies[strategyName]?.(
      { session, options },
      { twitterId, twitterName, twitterRestId: restId },
      list,
      ctx,
      config
    );
  }
};
