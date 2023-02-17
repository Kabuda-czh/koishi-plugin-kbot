/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-03 12:57:50
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-09 18:27:13
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\twitter\dynamic\common.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { Argv, Channel, Context, Dict, Quester } from "koishi";
import { Config, logger } from ".";
import {
  DynamicNotifiction,
} from "../model";
import { renderFunction } from "./render";

const fetchUserInfo = async (
  uid: string,
  http: Quester
): Promise<any> => {
  const res = await http.get(
    `https://api.twitter.com/x/space/acc/info?mid=${uid}&gaia_source=m_station`,
    {
      headers: {
        Referer: `https://space.twitter.com/${uid}/dynamic`,
      },
    }
  );
  if (res.code !== 0) throw new Error(`Failed to get user info. ${res}`);
  return res.data;
};

export async function twitterAdd(
  { session }: Argv<never, "id" | "guildId" | "platform" | "twitter", any>,
  uid: string,
  list: Dict<
    [
      Pick<Channel, "id" | "guildId" | "platform" | "twitter">,
      DynamicNotifiction
    ][]
  >,
  ctx: Context
) {
  if (
    session.channel.twitter.dynamic.find(
      (notification) => notification.twitterId === uid
    )
  ) {
    return "该用户已在监听列表中。";
  }
  try {
    const { name } = await fetchUserInfo(uid, ctx.http);
    const notification: DynamicNotifiction = {
      botId: `${session.platform}:${session.bot.userId || session.bot.selfId}`,
      twitterId: uid,
      twitterName: name,
    };
    session.channel.twitter.dynamic.push(notification);
    (list[uid] ||= []).push([
      {
        id: session.channel.id,
        guildId: session.channel.guildId,
        platform: session.platform,
        twitter: session.channel.twitter,
      },
      notification,
    ]);
    return `成功添加 up主: ${name}`;
  } catch (e) {
    logger.error(`Failed to add user ${uid}. ${e}`);
    return "请求失败，请检查 uid 是否正确或重试" + e;
  }
}

export async function twitterRemove(
  { session }: Argv<never, "id" | "guildId" | "platform" | "twitter", any>,
  uid: string,
  list: Dict<
    [
      Pick<Channel, "id" | "guildId" | "platform" | "twitter">,
      DynamicNotifiction
    ][]
  >
) {
  const { channel } = session;
  const index = channel.twitter.dynamic.findIndex(
    (notification) => notification.twitterId === uid
  );
  if (index === -1) return "该用户不在监听列表中。";
  channel.twitter.dynamic.splice(index, 1);
  const listIndex = list[uid].findIndex(
    ([{ id, guildId, platform }, notification]) => {
      return (
        channel.id === id &&
        channel.guildId === guildId &&
        channel.platform === platform &&
        notification.twitterId === uid
      );
    }
  );
  if (listIndex === -1) throw new Error("Data is out of sync.");
  const name = list[uid][listIndex]?.[1].twitterName;
  delete list[uid];
  return `成功删除 up主: ${name}`;
}

export async function twitterList({
  session,
}: Argv<never, "id" | "guildId" | "platform" | "twitter", any, any>) {
  if (session.channel.twitter.dynamic.length === 0) return "监听列表为空。";
  return session.channel.twitter.dynamic
    .map(
      (notification) =>
        "- " + notification.twitterId + " " + notification.twitterName
    )
    .join("\n");
}

export async function twitterSearch(
  { session }: Argv<never, "id" | "guildId" | "platform" | "twitter", any>,
  uid: string,
  list: Dict<
    [
      Pick<Channel, "id" | "guildId" | "platform" | "twitter">,
      DynamicNotifiction
    ][]
  >,
  ctx: Context,
  config: Config
) {
  // try {
  //   const { data } = await getDynamic(ctx.http, uid);
  //   const items = data.items as BilibiliDynamicItem[];

  //   if (items.length === 0) return "该 up 没有动态";

  //   const dynamic =
  //     items[0].modules.module_tag?.text === "置顶" ? items[1] : items[0];

  //   return renderFunction(ctx, dynamic, config);
  // } catch (e) {
  //   logger.error(`Failed to get user dynamics. ${e}`);
  //   return "动态获取失败" + e;
  // }
}
