/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-03 13:38:46
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-07-24 12:02:05
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\bilibili\dynamic\render.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import fs from 'node:fs'
import path from 'node:path'
import type { Context } from 'koishi'
import { segment } from 'koishi'
import type { Page } from 'puppeteer-core'
import type { BilibiliDynamicItem, LivePlayInfo } from '../model'
import { getFontsList } from '../../utils'
import { BilibiliDynamicItemType } from '../enum'
import GeneratePath from '../../../config'
import { logger } from '.'
import type { IConfig } from '.'

export async function renderFunction(
  ctx: Context,
  item: BilibiliDynamicItem,
  config: IConfig,
): Promise<string> {
  try {
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
  catch (e) {
    logger.error('render error', e)
    throw e
  }
}

async function pcRenderImage(
  ctx: Context,
  item: BilibiliDynamicItem,
): Promise<string> {
  let page: Page
  try {
    const { renderFontsDir, bilibiliCookiePath } = GeneratePath.getInstance(ctx.baseDir).getGeneratePathData()

    const needLoadFontList = await getFontsList(renderFontsDir, logger)

    const url = `https://t.bilibili.com/${item.id_str}`

    page = await ctx.puppeteer.page()
    await page.setViewport({ width: 1920 * 2, height: 1080 * 2 })

    let cookie: any
    try {
      cookie = JSON.parse(
        await fs.promises.readFile(
          bilibiliCookiePath,
          'utf-8',
        ),
      )
    }
    catch (e) {
      logger.error(`Failed to get cookie info. ${e}`)
      throw new Error('cookie 信息未找到, 请使用 --ck <cookie> 添加 cookie')
    }

    Object.entries(cookie).forEach(([key, value]: [string, string]) => {
      page.setCookie({
        url,
        name: key,
        value,
      })
    })

    await page.goto(url)
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
    const elementClip = await element?.boundingBox()

    return (
      `${item.modules.module_author.name} ${new Date(item.modules.module_author.pub_ts * 1000).toLocaleString()}\n${BilibiliDynamicItemType[item.type] || '发布了动态'}:\n${
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
    throw e.message
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
    const { renderFontsDir, bilibiliCookiePath } = GeneratePath.getInstance(ctx.baseDir).getGeneratePathData()

    const needLoadFontList = await getFontsList(renderFontsDir, logger)

    const url = `https://m.bilibili.com/dynamic/${item.id_str}`

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

    let cookie: any
    try {
      cookie = JSON.parse(
        await fs.promises.readFile(
          bilibiliCookiePath,
          'utf-8',
        ),
      )
    }
    catch (e) {
      logger.error(`Failed to get cookie info. ${e}`)
      throw new Error('cookie 信息未找到, 请使用 --ck <cookie> 添加 cookie')
    }

    Object.entries(cookie).forEach(([key, value]: [string, string]) => {
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
    const elementClip = await element?.boundingBox()

    return (
      `${item.modules.module_author.name} ${new Date(item.modules.module_author.pub_ts * 1000).toLocaleString()}\n${BilibiliDynamicItemType[item.type] || '发布了动态'}:\n${
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
    throw e.message
  }
  finally {
    page?.close()
  }
}

async function renderText(item: BilibiliDynamicItem): Promise<string> {
  const author = item.modules.module_author
  let result = `${author.name} ${new Date(author.pub_ts * 1000).toLocaleString()}\n`

  if (item.type === 'DYNAMIC_TYPE_AV') {
    const dynamic = item.modules.module_dynamic
    result += `发布了视频: \n${dynamic.major.archive.title}\n<image url="${dynamic.major.archive.cover}"/>`
  }
  else if (item.type === 'DYNAMIC_TYPE_DRAW') {
    const dynamic = item.modules.module_dynamic
    result += `发布了动态: \n${
      dynamic.desc.text
    }\n${dynamic.major.draw.items
      .map(item => `<image url="${item.src}"/>`)
      .join('')}`
  }
  else if (item.type === 'DYNAMIC_TYPE_WORD') {
    const dynamic = item.modules.module_dynamic
    result += `发布了动态: \n${dynamic.desc.text}`
  }
  else if (item.type === 'DYNAMIC_TYPE_FORWARD') {
    const dynamic = item.modules.module_dynamic
    result += `转发动态: \n${dynamic.desc.text}\n${await renderText(
      item.orig,
    )}`
  }
  else if (item.type === 'DYNAMIC_TYPE_LIVE_RCMD') {
    const dynamic = item.modules.module_dynamic
    const info: LivePlayInfo = JSON.parse(dynamic.major.live_rcmd.content)
    result += `开始直播: \n${info.title || info.live_play_info.title}`
    if (info.cover)
      result += `\n${segment.image(info.cover || info.live_play_info.cover)}`
  }
  else {
    result += `发布了未知类型的动态: \n${(item as any).type}`
  }
  return `${result}\nhttps://t.bilibili.com/${item.id_str}`
}
