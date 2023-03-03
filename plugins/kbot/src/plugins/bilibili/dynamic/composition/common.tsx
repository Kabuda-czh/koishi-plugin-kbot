/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-06 17:22:33
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-03-03 00:59:11
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\bilibili\dynamic\composition\common.tsx
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { Argv, Dict, Channel, Context } from "koishi";
import { Config, logger } from "..";
import { DynamicNotifiction } from "../../model";
import * as fs from "fs";
import { resolve } from "path";
import { getDanmukuData, getMedalWall, getMemberCard } from "../../utils";
import { getFontsList } from "../../../utils";
import { renderVup } from "./render";

export async function bilibiliVupCheck(
  { session }: Argv<never, "id" | "guildId" | "platform" | "bilibili", any>,
  uid: string,
  list: Dict<
    [
      Pick<Channel, "id" | "guildId" | "platform" | "bilibili">,
      DynamicNotifiction
    ][]
  >,
  ctx: Context,
  config: Config
) {
  try {
    const searchUserCardInfo = await getMemberCard(ctx.http, uid);

    const needLoadFontList = await getFontsList(logger);

    let vdb, cookie;

    try {
      vdb = JSON.parse(
        fs.readFileSync(
          resolve(__dirname, "../../../../../../../public/kbot/bilibili/vup.json"),
          "utf-8"
        )
      );
    } catch (e) {
      logger.error(`Failed to get vup info. ${e}`);
      throw new Error("vtb信息未找到, 请使用 --re 或 --refresh 更新vup信息");
    }

    try {
      cookie = JSON.parse(
        fs.readFileSync(
          resolve(__dirname, "../../../../../../../public/kbot/bilibili/cookie.json"),
          "utf-8"
        )
      );
    } catch (e) {
      logger.error(`Failed to get cookie info. ${e}`);
      throw new Error("cookie信息未找到, 请使用 --ck 或 --cookie 更新cookie信息");
    }

    let vups: any[] = vdb.filter((vup) => searchUserCardInfo.card.attentions.includes(vup.mid));

    const vupsLength = vups.length;

    const cookieString = Object.entries(cookie)
      .map(([key, value]) => `${key}=${value}`)
      .join("; ");

    const medals = await getMedalWall(ctx.http, uid, cookieString);

    const medalArray = medals.data.list;

    medalArray.sort((a, b) => b.medal_info.level - a.medal_info.level);

    const frontVups = [],
      medalMap = {};

    for (const medal of medalArray) {
      const up = {
        mid: medal.medal_info.target_id,
        uname: medal.target_name,
      };

      frontVups.push(up);
      medalMap[medal.medal_info.target_id] = medal;
    }

    vups = frontVups.concat(vups)
    vups = frontVups.concat(vups.slice(frontVups.length));
    for(let i = frontVups.length; i < vups.length; i++) {
      if (medalMap[vups[i].mid]) {
        vups.splice(i, 1)
        i--;
      }
    }

    if (vups.length > 50) await session.send("成分太多了, 只显示前50个");

    const image = renderVup(searchUserCardInfo, vups, vupsLength, medalMap, needLoadFontList);

    await session.send(image)

  } catch (e) {
    logger.error(`Failed to get vup info. ${e}`);
    return "成分获取失败: " + e.message;
  }
}

export async function bilibiliDanmuCheck(
  { session }: Argv<never, "id" | "guildId" | "platform" | "bilibili", any>,
  uid: string,
  list: Dict<
    [
      Pick<Channel, "id" | "guildId" | "platform" | "bilibili">,
      DynamicNotifiction
    ][]
  >,
  ctx: Context,
  config: Config
) {
  try {
    const searchUserCardInfo = await getMemberCard(ctx.http, uid);

    const needLoadFontList = await getFontsList(logger);

    const danmuku = await getDanmukuData(ctx.http, uid)

    const image = renderDanmu(searchUserCardInfo, danmuku, needLoadFontList)

    await session.send(image);

    return "功能还在开发喵~";
  } catch (e) {
    logger.error(`Failed to get danmu info. ${e}`);
    return "弹幕获取失败" + e;
  }
}

export async function bilibiliRefreshVup() {
  const vtbURLs = [
    "https://api.vtbs.moe/v1/short",
    "https://api.tokyo.vtbs.moe/v1/short",
    "https://vtbs.musedash.moe/v1/short",
  ];

  try {
    const vtbFetchs = await Promise.allSettled(
      vtbURLs.map((url) =>
        fetch(url)
          .then((res) => res.json())
          .then((res) => res)
      )
    );

    const vtbDatas = vtbFetchs.filter((res) => res.status === "fulfilled");

    if (vtbDatas.length === 0) return "vup 获取失败";

    const vtbs = [];

    vtbDatas.forEach((res: any) => {
      vtbs.push(...res.value);
    });

    if (
      !fs.existsSync(resolve(__dirname, "../../../../../../../public/kbot/bilibili"))
    )
      fs.mkdirSync(resolve(__dirname, "../../../../../../../public/kbot/bilibili"));
    fs.writeFileSync(
      resolve(__dirname, "../../../../../../../public/kbot/bilibili/vup.json"),
      JSON.stringify(vtbs)
    );

    return "vup 更新成功";
  } catch (err) {
    logger.error(`Failed to update vup. ${err}`);
    return `vup 更新失败: ${err}`;
  }
}

export async function bilibiliCookie({
  session,
  options,
}: Argv<
  never,
  "id" | "guildId" | "platform" | "bilibili",
  any,
  {
    cookie: string;
  }
>) {
  try {
    if (!options.cookie) return "请提供cookie";

    const cookieRegex = /\d*\w*([-+.,*]\w+)*=\d*\w*([-+.,*]\w+)*(==)*/gi;

    if (!cookieRegex.test(session.content)) return "cookie 格式错误";

    const cookies = session.content.match(cookieRegex);

    const cookieJson = {};

    cookies.forEach((cookie) => {
      const [key, value] = cookie.split("=");
      cookieJson[key] = value;
    });

    if (
      !fs.existsSync(resolve(__dirname, "../../../../../../../public/kbot/bilibili"))
    )
      fs.mkdirSync(resolve(__dirname, "../../../../../../../public/kbot/bilibili"));
    fs.writeFileSync(
      resolve(__dirname, "../../../../../../../public/kbot/bilibili/cookie.json"),
      JSON.stringify(cookieJson)
    );

    return "cookie 更新成功";
  } catch (err) {
    logger.error(`Failed to update cookie. ${err}`);
    return `cookie 更新失败: ${err}`;
  }
}
