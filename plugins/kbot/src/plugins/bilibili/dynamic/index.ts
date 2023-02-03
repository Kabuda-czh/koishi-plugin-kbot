/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:43:47
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-03 17:42:27
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\bilibili\dynamic\index.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { Argv, Context, Channel, Dict, Quester, Schema, Logger } from "koishi";
import {} from "koishi-plugin-puppeteer";
import { BilibiliDynamicItem, DynamicNotifiction } from "../model";
import { getDynamic } from "../utils";
import { dynamicStrategy } from "./dynamic.strategy";
import { listen } from "./listen";

declare module ".." {
  interface BilibiliChannel {
    dynamic?: DynamicNotifiction[];
  }
}

export interface LivePlayInfo {
  title: string;
  cover: string;
  link: string;
}

export interface Config {
  interval: number;
  device: string;
  live: boolean;
}

export const Config: Schema<Config> = Schema.object({
  interval: Schema.number()
    .description("请求之间的间隔 (秒) 注: 最低 10 秒!")
    .default(10)
    .min(10),
  device: Schema.union([
    Schema.const("pc").description("电脑"),
    Schema.const("mobile").description("手机"),
  ])
    .default("pc")
    .description("截图类型 (手机/电脑)"),
  live: Schema.boolean().description("是否监控开始直播的动态").default(true),
});

export const logger = new Logger("KBot-bilibili-dynamic");

export async function apply(ctx: Context, config: Config) {
  const channels = await ctx.database.get("channel", {}, [
    "id",
    "guildId",
    "platform",
    "bilibili",
  ]);
  const list = channels
    .filter((channel) => channel.bilibili.dynamic)
    .reduce((acc, x) => {
      x.bilibili.dynamic.forEach((notification) => {
        (acc[notification.bilibiliId] ||= []).push([x, notification]);
      });
      return acc;
    }, {} as Dict<[Pick<Channel, "id" | "guildId" | "platform" | "bilibili">, DynamicNotifiction][]>);

  ctx
    .guild()
    .command("bilibili", "b站相关")
    .channelFields(["id", "guildId", "platform", "bilibili"])
    .before(checkDynamic)
    .usage("最低权限: 2 级")
    .option("add", "-a <uid:string> 添加订阅, 请输入要添加的up主uid", { authority: 2 })
    .option("remove", "-r <uid:string> 移除订阅, 请输入要移除的up主uid", {
      authority: 2,
    })
    .option(
      "check",
      "-c <upInfo:string> 查看动态, 请输入要查看动态的up主的 UID 或者 名字 或者 空间短链",
      { authority: 2 }
    )
    .option("list", "-l 展示当前订阅up主列表", { authority: 2 })
    .action(async ({ session, options }) => {
      if (Object.keys(options).length > 1) return "请不要同时使用多个参数";

      return dynamicStrategy({ session, options }, list, ctx, config);
    });

  const generator = listen(list, request, ctx, config);
  ctx.setInterval(async () => {
    await generator.next();
  }, config.interval * 1000);
}

function checkDynamic({ session }: Argv<never, "bilibili">) {
  session.channel.bilibili.dynamic ||= [];
}

async function request(
  uid: string,
  http: Quester
): Promise<BilibiliDynamicItem[]> {
  const res = await getDynamic(http, uid);
  if (res.code !== 0) throw new Error(`Failed to get dynamics. ${res}`);
  return (res.data.items as BilibiliDynamicItem[]).sort(
    (a, b) => b.modules.module_author.pub_ts - a.modules.module_author.pub_ts
  );
}
