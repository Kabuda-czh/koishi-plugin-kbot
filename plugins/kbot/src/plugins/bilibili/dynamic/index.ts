/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:43:47
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-06 17:45:57
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

import * as fs from "fs";
import path from "path";

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
  fonts: {
    enabled: boolean;
    isCreate?: boolean;
    fontsObjcet?: Dict<string, string>;
  };
}

const fontsUsage = `是否使用自定义字体截图, **注意**
- 需要在根目录下的 \`public\` 文件夹中的 \`fonts\` 文件夹下放入字体文件
- 若无 \`fonts\` 文件夹, 请自行创建`;

const fontsObjectUsage = `请将自定义字体名字与文件名字对应上, 且最好不要重复
- 左侧为自定义字体名字, 右侧为字体文件名字
- 例如: \`YaHei\` 对应 \`MicrosoftYaHei.ttf\`
- 若未填写, 将从 \`fonts\` 文件夹中按照文件名排序进行设置
- 推荐字体: \`HarmonyOS_Sans_SC\`
`;

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
  fonts: Schema.intersect([
    Schema.object({
      enabled: Schema.boolean().default(false).description(fontsUsage),
      isCreate: Schema.boolean().default(false).hidden(),
    }),
    Schema.union([
      Schema.object({
        enabled: Schema.const(true).required(),
        fontsObjcet: Schema.dict(String).description(fontsObjectUsage),
      }),
    ]),
  ]),
});

export const logger = new Logger("KBot-bilibili-dynamic");

export async function apply(ctx: Context, config: Config) {
  const channels = await ctx.database.get("channel", {}, [
    "id",
    "guildId",
    "platform",
    "bilibili",
  ]);

  if (config.fonts.enabled && !config.fonts.isCreate) {
    const fileNames = fs.readdirSync(
      path.resolve(__dirname, "../../../../../../public")
    );

    if (!fileNames.includes("fonts"))
      fs.mkdirSync(path.resolve(__dirname, "../../../../../../public/fonts"));

    config.fonts.isCreate = true;
    ctx.scope.update(config);
  }

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
    .command("kbot/bilibili", "b站相关")
    .channelFields(["id", "guildId", "platform", "bilibili"])
    .before(checkDynamic)
    .usage("最低权限: 2 级")
    .option("add", "-a <uid:string> 添加订阅, 请输入要添加的up主uid", {
      authority: 2,
    })
    .option("remove", "-r <uid:string> 移除订阅, 请输入要移除的up主uid", {
      authority: 2,
    })
    .option(
      "search",
      "-s <upInfo:string> 查看动态, 请输入要查看动态的 up 主的 uid 或者 名字 或者 空间短链",
      { authority: 2 }
    )
    .option("list", "-l 展示当前订阅up主列表", { authority: 2 })
    .option(
      "vup",
      "-v <upInfo:string> 查成分, 请输入要查看成分的 up 主的 uid 或者 名字",
      { authority: 2 }
    )
    .option(
      "danmu",
      "-d <upInfo:string> 查弹幕, 请输入要查看弹幕的 up 主的 uid 或者 名字",
      { authority: 2 }
    )
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
