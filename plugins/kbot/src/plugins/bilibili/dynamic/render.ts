/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-03 13:38:46
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-03 14:21:01
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\bilibili\dynamic\render.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { Context, segment } from "koishi";
import path from "path";
import { logger } from ".";
import { BilibiliDynamicItem } from "../model";
import { Page } from "puppeteer-core";

export async function pcRenderImage(
  ctx: Context,
  item: BilibiliDynamicItem
): Promise<string> {
  let page: Page;
  try {
    page = await ctx.puppeteer.page();
    await page.setViewport({ width: 1920 * 2, height: 1080 * 2 });
    await page.goto(`https://t.bilibili.com/${item.id_str}`);
    await page.waitForNetworkIdle();
    await (await page.$(".login-tip"))?.evaluate((e) => e.remove());
    await (await page.$(".bili-dyn-item__panel")).evaluate((e) => e.remove());
    await page.evaluate(() => {
      let popover: any;
      while ((popover = document.querySelector(".van-popover")))
        popover.remove();
    });
    const element = await page.$(".bili-dyn-item");
    return (
      `${item.modules.module_author.name} 发布了动态:\n` +
      segment.image(await element.screenshot()) +
      `\nhttps://t.bilibili.com/${item.id_str}`
    );
  } catch (e) {
    throw e;
  } finally {
    page?.close();
  }
}

export async function mobileRenderImage(
  ctx: Context,
  item: BilibiliDynamicItem
): Promise<string> {
  let page: Page;
  try {
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
      path: path.resolve(__dirname, "../static/mobileStyle.js"),
    });

    await page.evaluate("getMobileStyle()");
    await page.evaluate("imageComplete()");

    const element = await page.$("#app");
    return (
      `${item.modules.module_author.name} 发布了动态:\n` +
      segment.image(await element.screenshot()) +
      `\nhttps://t.bilibili.com/${item.id_str}`
    );
  } catch (e) {
    throw e;
  } finally {
    page?.close();
  }
}