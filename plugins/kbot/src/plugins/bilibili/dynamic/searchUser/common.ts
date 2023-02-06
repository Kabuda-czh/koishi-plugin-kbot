/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-06 17:22:33
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-06 17:48:17
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\bilibili\dynamic\searchUser\common.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { Argv, Dict, Channel, Context, intersection } from "koishi";
import { Config, logger } from "..";
import { DynamicNotifiction } from "../../model";
import { uidExtract } from "../../utils";

// TODO 查成分开发
export async function bilibiliVupCheck(
  {
    session,
    options,
  }: Argv<
    never,
    "id" | "guildId" | "platform" | "bilibili",
    any,
    { vup: string }
  >,
  list: Dict<
    [
      Pick<Channel, "id" | "guildId" | "platform" | "bilibili">,
      DynamicNotifiction
    ][]
  >,
  ctx: Context,
  config: Config
) {
  // const vupValue = options.vup;

  // const uid = await uidExtract(vupValue, { session }, logger, ctx);
  // if (!uid) return "未找到该 up, 请输入正确的 up 名 , up uid 或 up 首页链接";

  try {
    // const card = await getMemberCard(uid);

    // const vups = intersection(vdb,  card.Attensions);

    // const medals = getMedalWall(uid);
    // medals.sort((a, b) => b.level - a.level);

    // const frontVups = [], medalMap = {};

    // for(const medal of medals) {
    //   const up = {
    //     Mid: medal.Mid,
    //     Uname: medal.Uname,
    //   }

    //   frontVups.push(up);
    //   medalMap[medal.Mid] = medal;
    // }

    return "功能还在开发喵~"

  } catch (e) {
    logger.error(`Failed to get vup info. ${e}`);
    return "成分获取失败" + e;
  }
}

// TODO 查弹幕开发
export async function bilibiliDanmuCheck(
  {
    session,
    options,
  }: Argv<
    never,
    "id" | "guildId" | "platform" | "bilibili",
    any,
    { vup: string }
  >,
  list: Dict<
    [
      Pick<Channel, "id" | "guildId" | "platform" | "bilibili">,
      DynamicNotifiction
    ][]
  >,
  ctx: Context,
  config: Config
) {
  // const vupValue = options.vup;

  // const uid = await uidExtract(vupValue, { session }, logger, ctx);
  // if (!uid) return "未找到该 up, 请输入正确的 up 名 , up uid 或 up 首页链接";

  try {
    // const card = await getMemberCard(uid);

    // const vups = intersection(vdb,  card.Attensions);

    // const medals = getMedalWall(uid);
    // medals.sort((a, b) => b.level - a.level);

    // const frontVups = [], medalMap = {};

    // for(const medal of medals) {
    //   const up = {
    //     Mid: medal.Mid,
    //     Uname: medal.Uname,
    //   }

    //   frontVups.push(up);
    //   medalMap[medal.Mid] = medal;
    // }

    return "功能还在开发喵~"


  } catch (e) {
    logger.error(`Failed to get vup info. ${e}`);
    return "成分获取失败" + e;
  }
}