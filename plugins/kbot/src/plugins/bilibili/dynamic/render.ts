/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-03 13:38:46
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-07 14:19:05
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\bilibili\dynamic\render.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { Context, segment } from "koishi";
import path from "path";
import { Config, logger } from ".";
import { BilibiliDynamicItem } from "../model";
import { Page } from "puppeteer-core";
import { getFontsList } from "../utils";

export async function renderFunction(
  ctx: Context,
  item: BilibiliDynamicItem,
  config: Config
): Promise<string> {
  if (config.device === "pc") {
    return pcRenderImage(ctx, item, config);
  } else {
    return mobileRenderImage(ctx, item, config);
  }
}

async function pcRenderImage(
  ctx: Context,
  item: BilibiliDynamicItem,
  config: Config
): Promise<string> {
  let page: Page;
  try {
    const needLoadFontList = await getFontsList(config);

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
        }),
        "image/png"
      ) +
      `\nhttps://t.bilibili.com/${item.id_str}`
    );
  } catch (e) {
    logger.error("pc render error", e);
    throw e;
  } finally {
    page?.close();
  }
}

async function mobileRenderImage(
  ctx: Context,
  item: BilibiliDynamicItem,
  config: Config
): Promise<string> {
  let page: Page;
  try {
    const needLoadFontList = await getFontsList(config);
    
    page = await ctx.puppeteer.page();

    await page
      .setViewport({
        width: 460,
        height: 720,
        isMobile: true,
      })
      .then(() =>
        page.setUserAgent(
          "Mozilla/5.0 (Linux; Android 10; MI 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Mobile Safari/537.36"
        )
      );

    await page.goto(`https://m.bilibili.com/dynamic/${item.id_str}`, {
      waitUntil: "networkidle0",
      timeout: 20000,
    });

    if (page.url().includes("bilibili.com/404")) {
      logger.warn(`[bilibili推送] ${item.id_str} 动态不存在`);
      throw new Error("not found");
    }

    await page.addScriptTag({
      path: path.resolve(__dirname, "../static/bilibiliStyle.js"),
    });

    await page.evaluate("getBilibiliStyle()");
    await page.evaluate("imageComplete()");
    if (needLoadFontList.length > 0)
      await page.evaluate(`setFont(${JSON.stringify(needLoadFontList)})`);

    const element =
      (await page.$(".opus-modules")) ?? (await page.$(".dyn-card"));
    const elementClip = await element.boundingBox();

    return (
      `${item.modules.module_author.name} 发布了动态:\n` +
      segment.image(
        await page.screenshot({
          clip: elementClip,
        }),
        "image/png"
      ) +
      `\nhttps://t.bilibili.com/${item.id_str}`
    );
  } catch (e) {
    logger.error("mobile render error", e);
    throw e;
  } finally {
    page?.close();
  }
}
