/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:28:53
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-01-30 11:30:37
 * @FilePath: \KBot-App\plugins\kbot\src\basic\index.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { Context, Schema } from "koishi";
import {} from "@koishijs/plugin-console";

export interface Config {
  superAdminQQ: string;
}

export const Config: Schema<Config> = Schema.object({
  superAdminQQ: Schema.string().required().description("超级管理员QQ号"),
});

export const using = ['database']

export function apply(ctx: Context, config: Config) {
  ctx.middleware((session, next) => {
    if (session.content === "天王盖地虎") {
      return "宝塔镇河妖";
    } else {
      return next();
    }
  });

  ctx.on("bot-status-updated", (bot) => {
    // 这里的 selfId 换成机器人的账号
    if (bot.status === "online") {
      // 这里的 userId 换成你的账号
      bot.sendPrivateMessage(config.superAdminQQ, "我上线了~");
    }
  });
}
