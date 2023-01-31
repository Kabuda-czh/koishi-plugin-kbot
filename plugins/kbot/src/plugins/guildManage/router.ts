/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-31 17:23:44
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-01-31 18:06:42
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\guildManage\router.ts
 * @Description:
 *
 * Copyright (c) 2023 by ${git_name}, All Rights Reserved.
 */
import { Context, Universal } from "koishi";
import { Context as KoaContext } from 'koa'
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

export const routerStrategies: IRouterStrategy = {
  "/guildList": function (context: Context) {
    return async (ctx) => {
      await Promise.all(
        context.bots.flatMap((bot) =>
          bot.platform === "onebot" ? bot.getGuildList() : []
        )
      ).then((res: Universal.Guild[]) => {
        ctx.body = res.flat();
      });
    };
  },
  "/guildMemberList": function (context: Context) {
    return async (ctx) => {
      await Promise.all(
        context.bots.flatMap((bot) =>
          bot.platform === "onebot"
            ? bot.getGuildMemberList(ctx.query.guildId as string)
            : []
        )
      ).then((res: GuildMemberInfo[]) => {
        ctx.body = res.flat();
      });
    };
  },
  "/muteGuild": function (context: Context) {
    return async (ctx) => {
      await Promise.all(
        context.bots.flatMap((bot) =>
          bot.platform === "onebot"
            ? bot.muteChannel(
                ctx.query.guildId as string,
                "",
                (ctx.query.mute as string) === "1"
              )
            : []
        )
      ).then((res) => {
        ctx.body = res.flat();
      });
    };
  },
  "/muteMember": function (context: Context) {
    return async (ctx) => {
      await Promise.all(
        context.bots.flatMap((bot) =>
          bot.platform === "onebot"
            ? bot.muteGuildMember(
                ctx.query.guildId as string,
                ctx.query.userId as string,
                1000 * 60
              )
            : []
        )
      ).then((res) => {
        ctx.body = res.flat();
      });
    };
  },
};
