/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:28:53
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-16 02:11:37
 * @FilePath: \koishi-plugin-kbot\plugins\kbot\src\basic\status\index.tsx
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { Context, Schema, version } from "koishi";
import { getSystemInfo } from "./utils";
import { resolve } from "path";

export interface Config {

}

export const Config: Schema<Config> = Schema.object({

});

export async function apply(ctx: Context, config: Config) {
  ctx.command("checkBody", "检查机器人状态")
    .shortcut("检查身体")
    .action(async ({ session }) => {
      const name = "KBot";
      const dashboardColor = ["var(--main-color)", "#ffb3cc", "#fcaa93", "#b7a89e"];

      const systemInfo = await getSystemInfo(version, ctx.registry.size);

      const status = <html>
        <head>
          <link href={resolve(__dirname, "./assets/css/renderA/font.css")} rel="stylesheet" />
          <link href={resolve(__dirname, "./assets/css/renderA/circle.css")} rel="stylesheet" />
          <link href={resolve(__dirname, "./assets/css/renderA/style.css")} rel="stylesheet" />
        </head>
        <div id="app">
          <div id="background-page">
            <div class="__title">
              <span class="__title-text" id="config_name">{name}</span>
              <img class="__title-image" src={resolve(__dirname, "./assets/image/marker.png")} />
            </div>
            <ul class="__dashboard" id="config_dashboard">
              {
                systemInfo.dashboard.map((item, index) => {
                  return <li
                    class="__dashboard-block __cpu"
                    style={{
                      "--block-color": dashboardColor[index]
                    }}
                  >
                    <svg
                      width="102"
                      height="102"
                      viewBox="0 0 200 200"
                      class="circle-progress"
                      style={{
                        "--color": "var(--block-color)",
                        "--progress": `${0.5}`,
                      }}
                    >
                      <circle
                        class="__dashboard-block__progress circle-progress-bar"
                        stroke-linecap="round"
                        cx="100"
                        cy="100"
                        r="94"
                        fill="none"
                        transform="rotate(-93.8 100 100)"
                        stroke-width="12"
                      />
                    </svg>
                    <div class="__dashboard-block__info">
                      <p class="__dashboard-block__info__value">{item.title}</p>
                    </div>
                  </li>
                })
              }
            </ul>
            <ul class="__information" id="config_information">
              {
                systemInfo.information.map((item) => {
                  return <li class="__information-block">
                    <span class="__information-block__key">{item.key}</span>
                    <span class="__information-block__value">{item.value}</span>
                  </li>
                })
              }
            </ul>
            <p class="__footer" id="config_footer">已持续运行 21天 13小时 32分钟</p>
          </div>
        </div>
      </html >

      return status;
    });
}
