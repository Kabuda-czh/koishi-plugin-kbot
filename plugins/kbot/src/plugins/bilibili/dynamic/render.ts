/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-03 13:38:46
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-04-24 13:58:12
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\bilibili\dynamic\render.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import path from 'node:path'
import type { Context } from 'koishi'
import { segment } from 'koishi'
import type { Page } from 'puppeteer-core'
import type { BilibiliDynamicItem, LivePlayInfo } from '../model'
import { getFontsList } from '../../utils'
import { logger } from '.'
import type { IConfig } from '.'

export async function renderFunction(
  ctx: Context,
  item: BilibiliDynamicItem,
  config: IConfig,
): Promise<string> {
  if (config.useImage) {
    if (ctx.puppeteer) {
      if (config.device === 'pc')
        return pcRenderImage(ctx, item)
      else
        return mobileRenderImage(ctx, item)
    }
    else {
      return '未安装/启用 puppeteer 插件，无法使用图片渲染'
    }
  }
  else {
    return renderText(item)
  }
}

async function pcRenderImage(
  ctx: Context,
  item: BilibiliDynamicItem,
): Promise<string> {
  let page: Page
  try {
    const needLoadFontList = await getFontsList(logger)

    page = await ctx.puppeteer.page()
    await page.setViewport({ width: 1920 * 2, height: 1080 * 2 })
    await page.goto(`https://t.bilibili.com/${item.id_str}`)
    await page.waitForNetworkIdle()

    await page.addScriptTag({
      path: path.resolve(__dirname, '../static/bilibiliStyle.js'),
    })

    await page.evaluate(() => {
      let popover: any
      // eslint-disable-next-line no-cond-assign
      while ((popover = document.querySelector('.van-popover')))
        popover.remove()
    })

    await page.evaluate('getBilibiliStyle()')
    if (needLoadFontList.length > 0)
      await page.evaluate(`setFont(${JSON.stringify(needLoadFontList)})`)

    await page.evaluate(() => document.fonts.ready)
    const element = await page.$('.bili-dyn-item')
    const elementClip = await element.boundingBox()

    return (
      `${item.modules.module_author.name} 发布了动态:\n${
      segment.image(
        await element.screenshot({
          clip: elementClip,
          encoding: 'binary',
        }),
        'image/png',
      )
      }\nhttps://t.bilibili.com/${item.id_str}`
    )
  }
  catch (e) {
    logger.error('pc render error', e)
    throw e
  }
  finally {
    page?.close()
  }
}

async function mobileRenderImage(
  ctx: Context,
  item: BilibiliDynamicItem,
): Promise<string> {
  let page: Page
  try {
    const needLoadFontList = await getFontsList(logger)

    page = await ctx.puppeteer.page()

    await page
      .setViewport({
        width: 460,
        height: 720,
        isMobile: true,
      })
      .then(() =>
        page.setUserAgent(
          'Mozilla/5.0 (Linux; Android 10; MI 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Mobile Safari/537.36',
        ),
      )

    await page.goto(`https://m.bilibili.com/dynamic/${item.id_str}`, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    })

    if (page.url().includes('bilibili.com/404')) {
      logger.warn(`[bilibili推送] ${item.id_str} 动态不存在`)
      throw new Error('not found')
    }

    await page.addScriptTag({
      path: path.resolve(__dirname, '../static/bilibiliStyle.js'),
    })

    await page.evaluate('getBilibiliStyle()')
    await page.evaluate('imageComplete()')
    if (needLoadFontList.length > 0)
      await page.evaluate(`setFont(${JSON.stringify(needLoadFontList)})`)

    await page.evaluate(() => document.fonts.ready)
    const element
      = (await page.$('.opus-modules')) ?? (await page.$('.dyn-card'))
    const elementClip = await element.boundingBox()

    return (
      `${item.modules.module_author.name} 发布了动态:\n${
      segment.image(
        await page.screenshot({
          clip: elementClip,
          encoding: 'binary',
        }),
        'image/png',
      )
      }\nhttps://t.bilibili.com/${item.id_str}`
    )
  }
  catch (e) {
    logger.error('mobile render error', e)
    throw e
  }
  finally {
    page?.close()
  }
}

async function renderText(item: BilibiliDynamicItem): Promise<string> {
  const author = item.modules.module_author
  let result: string

  if (item.type === 'DYNAMIC_TYPE_AV') {
    const dynamic = item.modules.module_dynamic
    result = `${author.name} 发布了视频: ${dynamic.major.archive.title}\n<image url="${dynamic.major.archive.cover}"/>`
  }
  else if (item.type === 'DYNAMIC_TYPE_DRAW') {
    const dynamic = item.modules.module_dynamic
    result = `${author.name} 发布了动态: ${
      dynamic.desc.text
    }\n${dynamic.major.draw.items
      .map(item => `<image url="${item.src}"/>`)
      .join('')}`
  }
  else if (item.type === 'DYNAMIC_TYPE_WORD') {
    const dynamic = item.modules.module_dynamic
    result = `${author.name} 发布了动态: ${dynamic.desc.text}`
  }
  else if (item.type === 'DYNAMIC_TYPE_FORWARD') {
    const dynamic = item.modules.module_dynamic
    result = `${author.name} 转发动态: ${dynamic.desc.text}\n${await renderText(
      item.orig,
    )}`
  }
  else if (item.type === 'DYNAMIC_TYPE_LIVE_RCMD') {
    const dynamic = item.modules.module_dynamic
    const info: LivePlayInfo = JSON.parse(dynamic.major.live_rcmd.content)
    result = `${author.name} 开始直播: ${info.title}`
    if (info.cover)
      result += `\n${segment.image(info.cover)}`
  }
  else {
    result = `${author.name} 发布了未知类型的动态: ${(item as any).type}`
  }
  return `${result}\nhttps://t.bilibili.com/${item.id_str}`
}
