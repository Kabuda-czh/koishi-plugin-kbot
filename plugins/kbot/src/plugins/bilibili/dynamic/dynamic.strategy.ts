import { Argv, Channel, Context, Dict, Logger } from "koishi";
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
