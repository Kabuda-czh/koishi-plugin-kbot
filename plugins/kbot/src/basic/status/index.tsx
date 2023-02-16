/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:28:53
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-16 11:11:22
 * @FilePath: \KBot-App\plugins\kbot\src\basic\status\index.tsx
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { Context, Logger, Schema, segment, version } from "koishi";
import { getSystemInfo } from "./utils";
import { resolve } from "path";
import { Page } from "puppeteer-core";

export interface Config { }

export const Config: Schema<Config> = Schema.object({});

export const logger = new Logger("KBot-status");

export async function apply(ctx: Context, config: Config) {
  // FIXME jsx -> css 属性 stroke-dashoffset 无法渲染
  // ctx.command("checkBody", "检查机器人状态")
  //   .shortcut("检查身体")
  //   .action(async ({ session }) => {
  //     const dashboardColor = ["var(--main-color)", "#ffb3cc", "#fcaa93", "#b7a89e"];
  //     const systemInfo = await getSystemInfo(version, ctx.registry.size);

  //     const status = <html>
  //       <head>
  //         <link href={resolve(__dirname, "./assets/css/renderA/font.css")} rel="stylesheet" />
  //         <link href={resolve(__dirname, "./assets/css/renderA/circle.css")} rel="stylesheet" />
  //         <link href={resolve(__dirname, "./assets/css/renderA/style.css")} rel="stylesheet" />
  //       </head>
  //       <div id="app">
  //         <div id="background-page">
  //           <div class="__title">
  //             <span class="__title-text" id="config_name">{systemInfo.name}</span>
  //             <img class="__title-image" src={resolve(__dirname, "./assets/image/marker.png")} />
  //           </div>
  //           <ul class="__dashboard" id="config_dashboard">
  //             {
  //               systemInfo.dashboard.map((item, index) => {
  //                 return <li
  //                   class="__dashboard-block __cpu"
  //                   style={{
  //                     "--block-color": dashboardColor[index]
  //                   }}
  //                 >
  //                   <svg
  //                     width="102"
  //                     height="102"
  //                     viewBox="0 0 200 200"
  //                     class="circle-progress"
  //                     style={{
  //                       "--color": "var(--block-color)",
  //                       "--progress": item.progress,
  //                     }}
  //                   >
  //                     <circle
  //                       class="__dashboard-block__progress circle-progress-bar"
  //                       stroke-linecap="round"
  //                       cx="100"
  //                       cy="100"
  //                       r="94"
  //                       fill="none"
  //                       transform="rotate(-93.8 100 100)"
  //                       stroke-width="12"
  //                     />
  //                   </svg>
  //                   <div class="__dashboard-block__info">
  //                     <p class="__dashboard-block__info__value">{item.title}</p>
  //                   </div>
  //                 </li>
  //               })
  //             }
  //           </ul>
  //           <ul class="__information" id="config_information">
  //             {
  //               systemInfo.information.map((item) => {
  //                 return <li class="__information-block">
  //                   <span class="__information-block__key">{item.key}</span>
  //                   <span class="__information-block__value">{item.value}</span>
  //                 </li>
  //               })
  //             }
  //           </ul>
  //           <p class="__footer" id="config_footer">已持续运行 21天 13小时 32分钟</p>
  //         </div>
  //       </div>
  //     </html>

  //     return status;
  //   });

  ctx.command("body", "检查机器人状态")
    .shortcut("检查身体")
    .action(async ({ session }) => {
      const systemInfo = await getSystemInfo(version, ctx.registry.size);

      let page: Page;
      try {
        page = await ctx.puppeteer.page();
        await page.setViewport({ width: 1920 * 2, height: 1080 * 2 });
        await page.goto(`file:///${resolve(__dirname, "./neko/template.html")}`)
        await page.waitForNetworkIdle();
        await page.evaluate(`action(${JSON.stringify(systemInfo)})`);
        const element = await page.$("#background-page");
        return (
          segment.image(await element.screenshot({
            encoding: "binary"
          }), "image/png")
        );
      } catch (e) {
        logger.error("状态渲染失败: ", e);
        // throw new Error(`渲染失败: ${e.message}`);
        return "渲染失败" + e.message;
      } finally {
        page?.close();
      }
    });
}
