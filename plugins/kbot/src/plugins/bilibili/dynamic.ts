/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:43:47
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-01 14:22:21
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\bilibili\dynamic.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import {
  Argv,
  Context,
  Channel,
  Dict,
  Quester,
  Schema,
  segment,
  Logger,
} from "koishi";
import {} from "koishi-plugin-puppeteer";
import { Page } from "puppeteer-core";
import {
  BilibiliDynamicItem,
  DynamicNotifiction,
  BilibiliUserInfoApiData,
} from "./model";

declare module "." {
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
    .description("截图类型 (手机/电脑) - 开发中(暂时默认为电脑)"),
  live: Schema.boolean().description("是否监控开始直播的动态").default(true),
});

export const logger = new Logger("plugins/bilibili/dynamic");

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
    .command("bilibili", "b站订阅相关")
    .channelFields(["id", "guildId", "platform", "bilibili"])
    .before(checkDynamic)
    .option("add", "-a <uid:string>", { authority: 2 })
    .option("remove", "-r <uid:string>", { authority: 2 })
    .option("list", "-l", { authority: 2 })
    .action(async ({ session, options }) => {
      // TODO: 增加搜索功能
      if (Object.keys(options).length > 1) return "请不要同时使用多个参数";

      const uid = options.add?.trim() || options.remove?.trim();

      if (!uid && !options.list) return "请输入正确的uid";

      if (options.add) {
        if (
          session.channel.bilibili.dynamic.find(
            (notification) => notification.bilibiliId === uid
          )
        ) {
          return "该用户已在监听列表中。";
        }
        try {
          const { name } = await fetchUserInfo(uid, ctx.http);
          const notification: DynamicNotifiction = {
            botId: `${session.platform}:${
              session.bot.userId || session.bot.selfId
            }`,
            bilibiliId: uid,
            bilibiliName: name,
          };
          session.channel.bilibili.dynamic.push(notification);
          (list[uid] ||= []).push([
            {
              id: session.channel.id,
              guildId: session.channel.guildId,
              platform: session.platform,
              bilibili: session.channel.bilibili,
            },
            notification,
          ]);
          return `成功添加 up主: ${name}`;
        } catch (e) {
          return "请求失败，请检查 uid 是否正确或重试。";
        }
      } else if (options.remove) {
        const { channel } = session;
        const index = channel.bilibili.dynamic.findIndex(
          (notification) => notification.bilibiliId === uid
        );
        if (index === -1) return "该用户不在监听列表中。";
        channel.bilibili.dynamic.splice(index, 1);
        const listIndex = list[uid].findIndex(
          ([{ id, guildId, platform }, notification]) => {
            return (
              channel.id === id &&
              channel.guildId === guildId &&
              channel.platform === platform &&
              notification.bilibiliId === uid
            );
          }
        );
        if (listIndex === -1) throw new Error("Data is out of sync.");
        const name = list[uid][listIndex]?.[1].bilibiliName;
        delete list[uid];
        return `成功删除 up主: ${name}`;
      } else if (options.list) {
        if (session.channel.bilibili.dynamic.length === 0)
          return "监听列表为空。";
        return session.channel.bilibili.dynamic
          .map(
            (notification) =>
              "- " + notification.bilibiliId + " " + notification.bilibiliName
          )
          .join("\n");
      }
    });

  async function* listen() {
    while (true) {
      const entries = Object.entries(list);
      if (entries.length === 0) {
        yield;
        continue;
      }
      for (const [uid, notifications] of entries) {
        if (notifications.length === 0) continue;
        const time = notifications[0][1].lastUpdated;
        try {
          const items = await request(uid, ctx.http);
          // setup time on every start up
          if (!notifications[0]?.[1].lastUpdated) {
            notifications.forEach(
              ([, notification]) =>
                (notification.lastUpdated =
                  items[0]?.modules.module_author.pub_ts ||
                  Math.ceil(+new Date() / 1000))
            );
            continue;
          }
          let neo = items.filter(
            (item) => item.modules.module_author.pub_ts > time
          );
          if (!config.live)
            neo = neo.filter((item) => item.type !== "DYNAMIC_TYPE_LIVE_RCMD");
          if (neo.length !== 0) {
            const rendered = await Promise.all(
              neo.map((item) => pcRenderImage(ctx, item))
            );

            rendered.forEach((text, index) => {
              notifications.forEach(([channel, notification]) => {
                notification.lastUpdated =
                  neo[index].modules.module_author.pub_ts;
                ctx.bots[notification.botId].sendMessage(
                  channel.id,
                  text,
                  channel.guildId
                );
              });
            });
          }
        } catch (e) {
          logger.error(e);
        }
        yield;
      }
    }
  }

  const generator = listen();
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
  const res = await http.get(
    "https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?host_mid=" +
      uid,
    {
      headers: {
        Referer: `https://space.bilibili.com/${uid}/dynamic`,
      },
    }
  );
  if (res.code !== 0) throw new Error(`Failed to get dynamics. ${res}`);
  return (res.data.items as BilibiliDynamicItem[]).sort(
    (a, b) => b.modules.module_author.pub_ts - a.modules.module_author.pub_ts
  );
}

const fetchUserInfo = async (
  uid: string,
  http: Quester
): Promise<BilibiliUserInfoApiData["data"]> => {
  const res = await http.get(
    `https://api.bilibili.com/x/space/acc/info?mid=${uid}&gaia_source=m_station`,
    {
      headers: {
        Referer: `https://space.bilibili.com/${uid}/dynamic`,
      },
    }
  );
  if (res.code !== 0) throw new Error(`Failed to get user info. ${res}`);
  return res.data;
};

async function pcRenderImage(
  ctx: Context,
  item: BilibiliDynamicItem
): Promise<string> {
  let page: Page;
  try {
    page = await ctx.puppeteer.page();
    await page.setViewport({ width: 1920 * 2, height: 1080 * 2 });
    await page.goto(`https://t.bilibili.com/${item.id_str}`);
    await page.waitForNetworkIdle();
    await (await page.$(".login-tip"))?.evaluate((e) => e.remove());
    await (await page.$(".bili-dyn-item__panel")).evaluate((e) => e.remove());
    await page.evaluate(() => {
      let popover: any;
      while ((popover = document.querySelector(".van-popover")))
        popover.remove();
    });
    const element = await page.$(".bili-dyn-item");
    return (
      `${item.modules.module_author.name} 发布了动态:\n` +
      segment.image(await element.screenshot()) +
      `\nhttps://t.bilibili.com/${item.id_str}`
    );
  } catch (e) {
    throw e;
  } finally {
    page?.close();
  }
}

// async function mobileRenderImage(ctx: Context, item: BilibiliDynamicItem): Promise<string> {

// }
