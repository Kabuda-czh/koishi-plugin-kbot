/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-03 13:38:46
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-07-11 11:29:37
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\twitter\dynamic\render.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import fs from 'node:fs'
import type { Context } from 'koishi'
import { segment } from 'koishi'
import type { Page } from 'puppeteer-core'
import { StringFormat } from '../../utils'
import { TwitterDynamicType } from '../enum'
import type { Entry } from '../model'
import GeneratePath from '../../../config'
import { logger } from '.'
import type { IConfig } from '.'

export async function renderFunction(
  ctx: Context,
  entry: Entry,
  config: IConfig,
  isListen = true,
): Promise<string> {
  try {
    if (ctx.puppeteer && config.useImage)
      return renderImage(ctx, entry)
    else
      return renderText(ctx, entry, isListen, config.onlyMedia)
  }
  catch (err) {
    logger.error('推特渲染失败: ', err)
    throw err
  }
}

async function renderImage(ctx: Context, entry: Entry): Promise<string> {
  // 判断时间线
  let isRankTweet = false

  if (entry?.content?.clientEventInfo?.component === 'suggest_ranked_organic_tweet')
    isRankTweet = true

  const content = isRankTweet ? entry?.content?.items?.[0]?.item : entry?.content

  const twitterRestId = content?.itemContent?.tweet_results?.result?.rest_id
  const twitterScreenName
    = content?.itemContent?.tweet_results?.result?.core?.user_results?.result
      ?.legacy?.screen_name
  const twitterName
    = content?.itemContent?.tweet_results?.result?.core?.user_results?.result
      ?.legacy?.name
  let page: Page
  try {
    const { twitterCookiePath } = GeneratePath.getInstance(ctx.baseDir).getGeneratePathData()

    const url = StringFormat(
      TwitterDynamicType.UserStatusURL,
      twitterScreenName,
      twitterRestId,
    )

    page = await ctx.puppeteer.page()
    await page.setViewport({ width: 1920 * 2, height: 1080 * 2 })

    let cookie: any
    try {
      cookie = JSON.parse(
        await fs.promises.readFile(
          twitterCookiePath,
          'utf-8',
        ),
      )
    }
    catch (e) {
      logger.error(`Failed to get cookie info. ${e}`)
      throw new Error('cookie 信息未找到, 请使用 --ck <cookie> 添加 cookie')
    }

    cookie.cookieString.match(/([^=;\s]+)=([^=;\s]*)/g).forEach((item) => {
      const [key, value] = item.split('=')
      page.setCookie({
        url,
        name: key,
        value,
      })
    })

    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 120000,
    })
    await page.waitForNetworkIdle()

    const element = await page.$('article')
    const elementClip = await element?.boundingBox()

    const URL = `https://twitter.com/${twitterScreenName}/status/${twitterRestId}`

    return (
      `${twitterName} 发布了动态:\n${
      segment.image(
        await element.screenshot({
          clip: elementClip,
          encoding: 'binary',
        }),
        'image/png',
      )
      }\n${URL}`
    )
  }
  catch (e) {
    logger.error('推特图片渲染失败:', e)
    throw e.message
  }
  finally {
    page?.close()
  }
}

async function renderText(
  ctx: Context,
  entry: Entry,
  isListen = true,
  onlyMedia = false,
): Promise<string> {
  const entryResult = entry?.content?.itemContent?.tweet_results?.result
  if (!entryResult)
    throw new Error('数据获取失败')

  try {
    const name = entryResult.core.user_results?.result?.legacy?.name
    const screenName = entryResult.core.user_results?.result?.legacy?.screen_name
    const quote = entryResult?.quoted_status_result?.result
    const is_quote = !!quote
    const retweet = entryResult?.legacy?.retweeted_status_result?.result
    const is_retweet = !!retweet
    const data = entryResult?.legacy
    const tweetId = data.id_str
    const url = `推文地址: \nhttps://twitter.com/${screenName}/status/${tweetId}`

    let text = ''
    let hasShortURL = false
    const media = []

    if (is_quote) {
      text = `${name} 发布了动态: \n${data.full_text}\n`
      const mediaData = data.entities
      if (mediaData?.media) {
        mediaData.media.forEach((item) => {
          media.push(item.media_url_https)
        })
      }
      const quoteName = quote?.core?.user_results?.result?.legacy?.name || ''
      const quoteText = quote?.legacy?.full_text || ''
      text += `引用了 ${quoteName} 的推文: \n${quoteText}\n`

      const mediaEntities = quote?.legacy?.entities
      if (mediaEntities?.media) {
        mediaEntities.media.forEach((item) => {
          media.push(item.media_url_https)
        })
      }
    }
    else if (is_retweet) {
      text = `${name} 发布了动态: \n`
      const retweetName = retweet?.core?.user_results?.result?.legacy?.name
      const retweetText = retweet?.legacy?.full_text
      text += `转发了 ${retweetName} 的推文:
  ${retweetText}\n`
      const mediaData = retweet?.legacy?.entities
      if (mediaData?.media) {
        mediaData.media.forEach((item) => {
          media.push(item.media_url_https)
        })
      }
    }
    else {
      text = `${name} 发布了动态: \n${data.full_text}\n`
      const mediaData = data.entities
      if (mediaData?.media) {
        mediaData.media.forEach((item) => {
          media.push(item.media_url_https)
        })
      }
    }

    hasShortURL
      = data.full_text.includes('https://t.co')
      || (is_quote && quote?.legacy?.full_text?.includes('https://t.co'))
      || (is_retweet && retweet?.legacy?.full_text?.includes('https://t.co'))

    if (isListen && onlyMedia && media.length === 0)
      return

    return `${segment.escape(text)}\n${media.reduce(
      (str, httpStr) => (str += `<image url="${httpStr}" />\n`),
      '',
    )}${hasShortURL ? '' : `\n${url}`}`
  }
  catch (err) {
    logger.error('推特文字渲染失败: ', err)
    throw err.message
  }
}
