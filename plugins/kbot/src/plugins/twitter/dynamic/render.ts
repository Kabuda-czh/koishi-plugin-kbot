/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-03 13:38:46
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-28 15:09:30
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\twitter\dynamic\render.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { Context, segment } from "koishi";
import { Config, logger } from ".";
import { Page } from "puppeteer-core";
import { StringFormat } from "../../utils";
import { TwitterDynamicType } from "../enum";
import { Entry } from "../model";

export async function renderFunction(
  ctx: Context,
  entry: Entry,
  config: Config
): Promise<string> {
  if (config.useText) return renderText(ctx, entry);
  return renderImage(ctx, entry);
}

async function renderImage(ctx: Context, entry: Entry): Promise<string> {
  const twitterRestId = entry.sortIndex;
  const twitterScreenName =
    entry.content.itemContent.tweet_results.result.core.user_results.result
      .legacy.screen_name;
  const twitterName =
    entry.content.itemContent.tweet_results.result.core.user_results.result
      .legacy.name;
  let page: Page;
  try {
    // const needLoadFontList = await getFontsList(logger);
    const url = StringFormat(
      TwitterDynamicType.UserStatusURL,
      twitterScreenName,
      twitterRestId
    );

    page = await ctx.puppeteer.page();
    await page.setViewport({ width: 1920 * 2, height: 1080 * 2 });
    await page.goto(url);
    await page.waitForNetworkIdle();

    // if (needLoadFontList.length > 0)
    //   await page.evaluate(`setFont(${JSON.stringify(needLoadFontList)})`);

    const element = await page.$("article");
    const elementClip = await element.boundingBox();

    const URL = `https://twitter.com/${twitterScreenName}/status/${twitterRestId}`;

    return (
      `${twitterName} 发布了动态:\n` +
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

async function renderText(ctx: Context, entry: Entry): Promise<string> {
  const entryResult = entry.content.itemContent.tweet_results.result;
  if (!entryResult) throw new Error("entryResult is undefined");

  const name = entryResult.core.user_results.result.legacy.name;
  const screenName = entryResult.core.user_results.result.legacy.screen_name;
  const quote = entryResult?.quoted_status_result?.result;
  const is_quote = !!quote;
  const retweet = entryResult.legacy?.retweeted_status_result?.result;
  const is_retweet = !!retweet;
  const data = entryResult.legacy;
  const tweetId = data.id_str;
  const url = `推文地址: \nhttps://twitter.com/${screenName}/status/${tweetId}`;

  let text = "",
    hasShortURL = false,
    media = [];

  if (is_quote) {
    text = `${name} 发布了动态: \n${data.full_text}\n`;
    const mediaData = data.entities;
    if (mediaData.media) {
      mediaData.media.forEach((item) => {
        media.push(item.media_url_https);
      });
    }
    const quoteName = quote.core.user_results.result.legacy.name;
    const quoteText = quote.legacy.full_text;
    text += `引用了 ${quoteName} 的推文: \n${quoteText}\n`;

    const mediaEntities = quote.legacy.entities;
    if (mediaEntities.media) {
      mediaEntities.media.forEach((item) => {
        media.push(item.media_url_https);
      });
    }
  } else if (is_retweet) {
    text = `${name} 发布了动态: \n`;
    const retweetName = retweet.core.user_results.result.legacy.name;
    const retweetText = retweet.legacy.full_text;
    text += `转发了 ${retweetName} 的推文:
${retweetText}\n`;
    const mediaData = retweet.legacy.entities;
    if (mediaData.media) {
      mediaData.media.forEach((item) => {
        media.push(item.media_url_https);
      });
    }
  } else {
    text = `${name} 发布了动态: \n${data.full_text}\n`;
    const mediaData = data.entities;
    if (mediaData.media) {
      mediaData.media.forEach((item) => {
        media.push(item.media_url_https);
      });
    }
  }

  hasShortURL =
    data.full_text.includes("https://t.co") ||
    (is_quote && quote?.legacy?.full_text?.includes("https://t.co")) ||
    (is_retweet && retweet?.legacy.full_text?.includes("https://t.co"));

  return `${text}\n${media.reduce(
    (str, httpStr) => (str += `<image url="${httpStr}" />\n`),
    ""
  )}${hasShortURL ? "" : "\n" + url}`;
}
