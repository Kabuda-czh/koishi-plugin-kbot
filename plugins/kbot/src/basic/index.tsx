/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:28:53
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-03-06 11:49:49
 * @FilePath: \KBot-App\plugins\kbot\src\basic\index.tsx
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { Context, Logger, Schema } from "koishi";
import * as statusPlugin from "./status";

export interface Config {
  yiyan?: boolean;
  renjian?: boolean;
  news?: boolean;
  weather?: boolean;
  alApiToken?: string;
  body?: boolean;
}

export const Config: Schema<Config> = Schema.object({
  yiyan: Schema.boolean().default(false).description("是否开启一言"),
  renjian: Schema.boolean().default(false).description("是否开启人间一言"),
  alApiToken: Schema.string().description("ALAPI Token, 注: 前往 https://www.alapi.cn/ 个人中心获取token (可选)"),
  news: Schema.boolean().default(false).description("是否开启今日新闻 (需要alApiToken)"),
  weather: Schema.boolean().default(false).description("是否开启天气查询 (需要alApiToken)"),
  body: Schema.boolean().default(false).description("是否开启自带的 status, 等同于插件 `status-pro` (需要 puppeteer)"),
});

export const logger = new Logger("KBot-basic");

export async function apply(ctx: Context, config: Config) {
  if (config.yiyan) {
    ctx.command("kbot/一言", "随机一言", {
      checkArgCount: true,
      showWarning: false
    }).action(async ({ session }) => {
      const yiyan = await ctx.http
        .get("https://api.pmay.cn/api/yiyan")
        .catch((err) => {
          logger.error(`获取一言时出错: ${err}`);
          return "获取一言失败";
        });

      if (!yiyan) return "获取一言失败";
      return yiyan;
    })
  }

  if (config.renjian) {
    ctx.command("kbot/人间", "随机一言散文集《我在人间凑数的日子》", {
      checkArgCount: true,
      showWarning: false
    }).action(async ({ session }) => {
      const data = await ctx.http
        .get("https://api.pmay.cn/api/renjian")
        .catch((err) => {
          logger.error(`获取人间一言时出错: ${err}`);
        });

      if (data.code !== 1) return "获取人间一言失败";
      return data.data.yiyan;
    })
  }

  if (config.alApiToken) {
    if (config.news) {
      ctx.command("kbot/今日新闻", "获取60秒看世界新闻", {
        checkArgCount: true,
        showWarning: false
      }).action(async ({ session }) => {
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

    if (config.weather) {
      ctx
        .command("kbot/天气 <city:string>", "查询城市天气")
        .shortcut(/^查询(.+)天气$/, { args: ['$1'] })
        .action(async ({ session }, city) => {
          const weather = await ctx.http
            .get(`https://v2.alapi.cn/api/tianqi?token=${config.alApiToken}&city=${city}`)
            .catch((err) => {
              logger.error(`获取天气信息时出错: ${err}`);
            });
          if (!weather) return "获取天气信息失败";
          const weatherData = weather.data;
          return `
城市: ${weatherData.city}
气温: ${weatherData.min_temp}℃/${weatherData.max_temp}℃ ${weatherData.weather}
日出时间: ${weatherData.sunrise}
日落时间: ${weatherData.sunset}
今日天气实况: 气温: ${weatherData.temp}℃; 风力/风向: ${weatherData.wind} ${weatherData.wind_speed}; 湿度: ${weatherData.humidity}; 空气等级: ${weatherData.aqi.air_level};
${Object.values(weatherData.index).map((item: any) => `${item.name}: ${item.level}, ${item.content}`).join("\n")}
`;
        });
    }
  }
  if (config.body) {
    if (ctx.puppeteer) {
      ctx.plugin(statusPlugin)
    } else logger.warn("未安装 puppeteer, 无法使用自带的 status 插件");
  }
}
