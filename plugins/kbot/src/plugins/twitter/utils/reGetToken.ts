/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-27 13:24:23
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-28 13:49:49
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\twitter\utils\reGetToken.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { Context, Logger } from "koishi";
import * as fs from "fs";
import { resolve } from "path";
import { Page } from "puppeteer-core";

export async function getTwitterToken(ctx: Context, logger: Logger) {
  let page: Page, cookie: any;

  try {
    page = await ctx.puppeteer.page();
    await page.goto("https://twitter.com/");
    await page.waitForNetworkIdle();
    const cookies = await page.cookies();
    const gtCookie = cookies.find((x) => x.name === "gt")?.value;

    fs.writeFileSync(
      resolve(__dirname, "../../../../../../public/kbot/twitter/cookie.json"),
      JSON.stringify({ cookies: gtCookie })
    );

    ctx.http.config.headers["x-guest-token"] = gtCookie;

    cookie = { cookies: gtCookie };

    logger.info("Twitter Token: ", gtCookie);
  } catch (error) {
  } finally {
    page?.close();
  }

  return cookie;
}
