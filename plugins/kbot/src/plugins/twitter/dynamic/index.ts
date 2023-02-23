/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:43:47
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-23 17:52:49
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\twitter\dynamic\index.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { Argv, Context, Channel, Dict, Quester, Schema, Logger } from "koishi";
import {} from "koishi-plugin-puppeteer";
import { Page } from "puppeteer-core";

import * as fs from "fs";
import path from "path";
import { DynamicNotifiction, UserTweetsResponse } from "../model";
import { listen } from "./listen";
import { dynamicStrategy } from "./dynamic.strategy";

declare module ".." {
  interface TwitterChannel {
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

export const logger = new Logger("KBot-twitter-dynamic");

export async function apply(ctx: Context, config: Config) {
  const cookieJson = {
    gt: "1628300495491313664",
  };

  const channels = await ctx.database.get("channel", {}, [
    "id",
    "guildId",
    "platform",
    "twitter",
  ]);

  const list = channels
    .filter((channel) => channel.twitter.dynamic)
    .reduce((acc, x) => {
      x.twitter.dynamic.forEach((notification) => {
        (acc[notification.twitterId] ||= []).push([x, notification]);
      });
      return acc;
    }, {} as Dict<[Pick<Channel, "id" | "guildId" | "platform" | "twitter">, DynamicNotifiction][]>);

  ctx
    .guild()
    .command("kbot/twitter", "推特相关")
    .channelFields(["id", "guildId", "platform", "twitter"])
    .before(checkDynamic)
    .usage("最低权限: 2 级")
    .option(
      "add",
      "-a <uid:string> 添加订阅, 请输入要添加的 twitter 博主的 id 名字(指 @后的字符串)",
      {
        authority: 2,
      }
    )
    .option(
      "remove",
      "-r <uid:string> 移除订阅, 请输入要移除的 twitter 博主的 id 名字(指 @后的字符串)",
      {
        authority: 2,
      }
    )
    .option(
      "search",
      "-s <upInfo:string> 查看最新动态, 请输入要查看动态的 twitter 博主的 id 名字(指 @后的字符串)",
      { authority: 2 }
    )
    .option("list", "-l 展示当前订阅 twitter 博主列表", { authority: 2 })
    .action(async ({ session, options }) => {
      if (Object.keys(options).length > 1) return "请不要同时使用多个参数";

      return dynamicStrategy({ session, options }, list, ctx, config);
    });

  // const generator = listen(list, request, ctx, config);
  // ctx.setInterval(async () => {
  //   await generator.next();
  // }, config.interval * 1000);

  // ctx.command("twittertest").action(async ({session}) => {
  //   let page: Page;

  //   ctx.http.get("https://twitter.com/i/api/graphql/rePnxwe9LZ51nQ7Sn_xN_A/UserByScreenName?variables=%7B%22screen_name%22%3A%22playvalorant%22%2C%22withSafetyModeUserFields%22%3Atrue%2C%22withSuperFollowsUserFields%22%3Atrue%7D&features=%7B%22responsive_web_twitter_blue_verified_badge_is_enabled%22%3Atrue%2C%22responsive_web_graphql_exclude_directive_enabled%22%3Afalse%2C%22verified_phone_label_enabled%22%3Afalse%2C%22responsive_web_graphql_skip_user_profile_image_extensions_enabled%22%3Afalse%2C%22responsive_web_graphql_timeline_navigation_enabled%22%3Atrue%7D", {
  //     headers: {
  //       "x-guest-token": "1628300495491313664"
  //     }
  //   }).then(resp => {
  //     console.log("resp", resp)
  //   }).catch(err => {
  //     const response = err.response
  //     if (response.status === 403 && response.data) {
  //       console.log(response.data.errors[0]?.code) // 239 -> reGetToken
  //     }
  //   })

  //   try {
  //     page = await ctx.puppeteer.page();
  //     await page.goto("https://twitter.com/");
  //     await page.waitForNetworkIdle()
  //     const cookies = await page.cookies();
  //     const gtCookie = cookies.find((x) => x.name === "gt")?.value;
  //     // session.send(String(await page.cookies()))
  //   } catch (error) {
  //   } finally {
  //     page?.close()
  //   }
  // })
}

function checkDynamic({ session }: Argv<never, "twitter">) {
  session.channel.twitter.dynamic ||= [];
}

async function request(
  uid: string,
  http: Quester
): Promise<UserTweetsResponse[]> {
  return {} as any
}
