/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:28:53
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-15 12:42:09
 * @FilePath: \KBot-App\plugins\kbot\src\basic\index.tsx
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { Context, Logger, Schema } from "koishi";

export interface Config {
  alApiToken?: string;
}

export const Config: Schema<Config> = Schema.object({
  alApiToken: Schema.string().description("ALAPI Token, 注: 前往 https://www.alapi.cn/ 个人中心获取token (可选)"),
});

export const logger = new Logger("KBot-basic");

export const using = ["database"];

export async function apply(ctx: Context, config: Config) {
  ctx
    .command("kbot/天气 <city:string>", "查询城市天气")
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

  ctx.command("kbot/一言", "随机一言").action(async ({ session }) => {
    const yiyan = await ctx.http
      .get("https://api.pmay.cn/api/yiyan")
      .catch((err) => {
        logger.error(`获取一言时出错: ${err}`);
        return "获取一言失败";
      });

    if (!yiyan) return "获取一言失败";
    return yiyan;
  })

  ctx.command("kbot/人间", "随机一言散文集《我在人间凑数的日子》").action(async ({ session }) => {
    const data = await ctx.http
      .get("https://api.pmay.cn/api/renjian")
      .catch((err) => {
        logger.error(`获取人间一言时出错: ${err}`);
      });

    if (data.code !== 1) return "获取人间一言失败";
    return data.data.yiyan;
  })

  if (config.alApiToken) {
    ctx.command("kbot/今日新闻", "获取60秒看世界新闻").action(async ({ session }) => {
      await ctx.http
        .get(`https://v2.alapi.cn/api/zaobao?token=${config.alApiToken}&format=json`)
        .then(res => {
          const { data } = res;
          session.send(<>
            <image url={data.image} />
          </>);
        }).catch(err => {
          logger.error(`获取今日新闻时出错: ${err}`);
          return "获取今日新闻失败";
        })

    })
  }
}
