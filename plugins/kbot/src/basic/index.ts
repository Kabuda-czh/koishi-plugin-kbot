/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:28:53
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-11 20:30:24
 * @FilePath: \KBot-App\plugins\kbot\src\basic\index.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { Context, Logger, Schema } from "koishi";

export interface Config {
  superAdminQQ: string;
}

export const Config: Schema<Config> = Schema.object({
  superAdminQQ: Schema.string().required().description("超级管理员QQ号 (必填)"),
});

export const logger = new Logger("KBot-basic");

export const using = ["database"];

export async function apply(ctx: Context, config: Config) {
  ctx.on("bot-status-updated", (bot) => {
    if (bot.status === "online") {
      logger.success("KBot已上线");
      ctx.database.getUser(bot.platform, config.superAdminQQ).then((user) => {
        try {
          if (user && user?.authority < 5) {
            ctx.database.setUser(bot.platform, config.superAdminQQ, {
              authority: 5,
            });
            logger.success(
              `已将QQ号为 ${config.superAdminQQ} 的用户权限设置为 5 级`
            );
          } else if (!user) {
            ctx.database.createUser(bot.platform, config.superAdminQQ, {
              authority: 5,
            });
            logger.success(
              `已成功创建QQ号为 ${config.superAdminQQ} 的用户, 并赋予权限 5 级`
            );
          }
        } catch (err) {
          logger.error(
            `设置QQ号为 ${config.superAdminQQ} 的用户权限时出错: ${err}`
          );
        }
      });
    }
  });

  ctx
    .command("天气 <city:string>", "查询城市天气")
    .shortcut(/^查询(.+)天气$/, { args: ['$1'] })
    .action(async ({ session }, city) => {
      const weather = await ctx.http
        .get(`https://api.pmay.cn/api/qqtq?msg=${city}`)
        .catch((err) => {
          logger.error(`获取天气信息时出错: ${err}`);
        });
      if (!weather) return "获取天气信息失败";
      return weather;
    });

  ctx.command("一言", "随机一言").action(async ({ session }) => {
    const yiyan = await ctx.http
      .get("https://api.pmay.cn/api/yiyan")
      .catch((err) => {
        logger.error(`获取一言时出错: ${err}`);
      });

    if (!yiyan) return "获取一言失败";
    return yiyan;
  })

  ctx.command("人间", "随机一言散文集《我在人间凑数的日子》").action(async ({ session }) => {
    const {data: {yiyan: renjian}} = await ctx.http
      .get("https://api.pmay.cn/api/renjian")
      .catch((err) => {
        logger.error(`获取人间一言时出错: ${err}`);
      });

    if (!renjian) return "获取人间一言失败";
    return renjian;
  })
}
