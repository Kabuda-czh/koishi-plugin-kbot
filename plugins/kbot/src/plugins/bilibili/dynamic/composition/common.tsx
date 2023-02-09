/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-06 17:22:33
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-09 17:53:22
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\bilibili\dynamic\composition\common.tsx
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { Argv, Dict, Channel, Context, segment } from "koishi";
import { Config, logger } from "..";
import { DynamicNotifiction } from "../../model";
import * as fs from "fs";
import { resolve } from "path";
import { getMedalWall, getMemberCard } from "../../utils";

// TODO 查成分开发
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

    // TODO 需要测试一下某些情况
    const vdb = JSON.parse(
      fs.readFileSync(
        resolve(__dirname, "../../../../../../../public/bilibili/vup.json"),
        "utf-8"
      )
    );

    const cookie = JSON.parse(
      fs.readFileSync(
        resolve(__dirname, "../../../../../../../public/bilibili/cookie.json"),
        "utf-8"
      )
    );

    const vups = vdb.filter((vup) => searchUserCardInfo.card.attentions.includes(vup.mid));

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

    vups.push(...frontVups);

    if (vups.length > 50) await session.send("成分太多了, 只显示前50个");

    const image = <html>
      <style>
        {`
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .info {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
          }

          .info div {
            display: flex;
            align-items: center;
            gap: 10px;
          }
        `}
      </style>
      <div class="header">
        <img src={searchUserCardInfo.card.face} />
        <div class="info">
          <div>
            <p>{searchUserCardInfo.card.name}</p>
            <p>{searchUserCardInfo.card.mid}</p>
          </div>
          <div style="justify-content: space-between">
            <p>粉丝: {searchUserCardInfo.card.fans}</p>
            <p>关注: {searchUserCardInfo.card.attentions.length}</p>
          </div>
          <div>
            <p>管人痴成分:
              {(vups.length
                /
                searchUserCardInfo.card.attentions.length * 100).toFixed(2)}%
              ({vups.length} / {searchUserCardInfo.card.attentions.length})
            </p>
          </div>
          <div>
            <p>注册日期: {new Date(searchUserCardInfo.card.regtime * 1000).toLocaleString()}</p>
          </div>
          <div>
            <p>查询日期: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
      <div>

      </div>
    </html>

    await session.send(image)

  } catch (e) {
    logger.error(`Failed to get vup info. ${e}`);
    return "成分获取失败" + e;
  }
}

// TODO 查弹幕开发
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
    const card: any = await getMemberCard(ctx.http, uid);

    // const vdb = await ctx.database.get("vup", {}, ["uname", "mid", "roomid"]);

    // const vups = vdb.filter((vup) => card.Attentions.includes(vup.mid));

    // const medals: any = await getMedalWall(ctx.http, uid);
    // medals.sort((a, b) => b.level - a.level);

    // const frontVups = [],
    //   medalMap = {};

    // for (const medal of medals) {
    //   const up = {
    //     Mid: medal.Mid,
    //     Uname: medal.Uname,
    //   };

    //   frontVups.push(up);
    //   medalMap[medal.Mid] = medal;
    // }

    // vups.push(...frontVups);

    return "功能还在开发喵~";
  } catch (e) {
    logger.error(`Failed to get vup info. ${e}`);
    return "成分获取失败" + e;
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
      !fs.existsSync(resolve(__dirname, "../../../../../../../public/bilibili"))
    )
      fs.mkdirSync(resolve(__dirname, "../../../../../../../public/bilibili"));
    fs.writeFileSync(
      resolve(__dirname, "../../../../../../../public/bilibili/vup.json"),
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
      !fs.existsSync(resolve(__dirname, "../../../../../../../public/bilibili"))
    )
      fs.mkdirSync(resolve(__dirname, "../../../../../../../public/bilibili"));
    fs.writeFileSync(
      resolve(__dirname, "../../../../../../../public/bilibili/cookie.json"),
      JSON.stringify(cookieJson)
    );

    return "cookie 更新成功";
  } catch (err) {
    logger.error(`Failed to update cookie. ${err}`);
    return `cookie 更新失败: ${err}`;
  }
}
