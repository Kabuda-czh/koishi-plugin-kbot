/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-03 13:38:46
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-17 16:12:06
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\twitter\dynamic\render.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { Context, segment } from "koishi";
import path from "path";
import { Config, logger } from ".";
import { Page } from "puppeteer-core";
import { getFontsList } from "../../utils";

export async function renderFunction(
  ctx: Context,
  item: any,
): Promise<string> {
  return pcRenderImage(ctx, item);
}

async function pcRenderImage(
  ctx: Context,
  item: any,
): Promise<string> {
  let page: Page;
  try {
    const needLoadFontList = await getFontsList(logger);

    page = await ctx.puppeteer.page();
    await page.setViewport({ width: 1920 * 2, height: 1080 * 2 });
    await page.goto(`https://t.bilibili.com/${item.id_str}`);
    await page.waitForNetworkIdle();

    await page.addScriptTag({
      path: path.resolve(__dirname, "../static/bilibiliStyle.js"),
    });

    await page.evaluate(() => {
      let popover: any;
      while ((popover = document.querySelector(".van-popover")))
        popover.remove();
    });

    await page.evaluate("getBilibiliStyle()");
    if (needLoadFontList.length > 0)
      await page.evaluate(`setFont(${JSON.stringify(needLoadFontList)})`);

    const element = await page.$(".bili-dyn-item");
    const elementClip = await element.boundingBox();

    return (
      `${item.modules.module_author.name} 发布了动态:\n` +
      segment.image(
        await element.screenshot({
          clip: elementClip,
          encoding: "binary",
        }),
        "image/png"
      ) +
      `\nhttps://t.bilibili.com/${item.id_str}`
    );
  } catch (e) {
    logger.error("twitter render error", e);
    throw e;
  } finally {
    page?.close();
  }
}
