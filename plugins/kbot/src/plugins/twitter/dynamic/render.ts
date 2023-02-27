/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-03 13:38:46
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-27 17:17:26
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\twitter\dynamic\render.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { Context, segment } from "koishi";
import { logger } from ".";
import { Page } from "puppeteer-core";
import { StringFormat } from "../../utils";
import { TwitterDynamicType } from "../enum";

export async function renderFunction(
  ctx: Context,
  item: { twitterId: string; tweetsRestId: string, dynamicURL: string }
): Promise<string> {
  return pcRenderImage(ctx, item);
}

async function pcRenderImage(
  ctx: Context,
  item: { twitterId: string; tweetsRestId: string, dynamicURL: string }
): Promise<string> {
  let page: Page;
  try {
    // const needLoadFontList = await getFontsList(logger);
    const url = StringFormat(
      TwitterDynamicType.UserStatusURL,
      item.twitterId,
      item.tweetsRestId
    );

    page = await ctx.puppeteer.page();
    await page.setViewport({ width: 1920 * 2, height: 1080 * 2 });
    await page.goto(url);
    await page.waitForNetworkIdle();

    // if (needLoadFontList.length > 0)
    //   await page.evaluate(`setFont(${JSON.stringify(needLoadFontList)})`);

    const element = await page.$("article");
    const elementClip = await element.boundingBox();

    const URL = item.dynamicURL || `https://twitter.com/${item.twitterId}/status/${item.tweetsRestId}`

    return (
      `${item.twitterId} 发布了动态:\n` +
      segment.image(
        await element.screenshot({
          clip: elementClip,
          encoding: "binary",
        }),
        "image/png"
      ) +
      `\n${URL}`
    );
  } catch (e) {
    logger.error("twitter render error", e);
    throw e;
  } finally {
    page?.close();
  }
}
