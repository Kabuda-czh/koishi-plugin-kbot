/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-31 17:23:44
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-01-31 19:15:45
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\guildManage\router.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { Context, Universal, Bot } from "koishi";
import { Context as KoaContext } from "koa";
interface UserInfo {
  userId: string;
  username: string;
  avatar?: string;
}

interface GuildMemberInfo extends UserInfo {
  nickname: string;
}

interface IRouterStrategy {
  [key: string]: (context: Context) => (ctx: KoaContext) => Promise<void>;
}

function handleFunction<T = any>(
  context: Context,
  functionName: keyof Bot,
  ...args: any
) {
  return async (ctx: KoaContext) => {
    await Promise.all(
      context.bots.flatMap((bot) =>
        bot.platform === "onebot" ? bot?.[functionName](...args.map(arg => arg = ctx.query?.[arg] as string || "")) : []
      )
    ).then((res: T[]) => {
      ctx.body = res.flat();
    });
  };
}

export const routerStrategies: IRouterStrategy = {
  "/guildList": function (context: Context) {
    return handleFunction<Universal.Guild>(context, "getGuildList")
  },
  "/guildMemberList": function (context: Context) {
    return handleFunction<GuildMemberInfo>(context, "getGuildMemberList", "guildId")
  },
  "/muteGuild": function (context: Context) {
    return handleFunction(context, "muteChannel", "guildId", "", "mute")
  },
  "/muteMember": function (context: Context) {
    return handleFunction(context, "muteGuildMember", "guildId", "userId", "duration")
  },
};
