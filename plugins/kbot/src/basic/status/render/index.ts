/*
 * @Author: Kabuda-czh
 * @Date: 2023-03-13 17:14:23
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-07-24 12:00:00
 * @FilePath: \KBot-App\plugins\kbot\src\basic\status\render\index.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import type { Context } from 'koishi'
import { segment } from 'koishi'
import type { Page } from 'puppeteer-core'
import type { SystemInfo } from '../utils'

// import { writeBlobToFile } from '../utils'
import { logger } from '..'
import GeneratePath from '../../../config'
import { getFontsList } from '../../../plugins/utils'

export async function renderHtml(ctx: Context, systemInfo: SystemInfo) {
  let page: Page
  try {
    const { statusFontsDir } = GeneratePath.getInstance(ctx.baseDir).getGeneratePathData()
    let needLoadFontList = await getFontsList(statusFontsDir, logger)
    needLoadFontList = needLoadFontList.filter(font => ['Gugi-Regular ttf', 'HachiMaruPop-Regular ttf'].includes(font.fontFamily))

    page = await ctx.puppeteer.page()
    await page.setViewport({ width: 1920 * 2, height: 1080 * 2 })

    await page.goto(`${pathToFileURL(resolve(__dirname, '../neko/template.html'))}`)
    await page.evaluate(`action(${JSON.stringify(systemInfo)})`)
    if (needLoadFontList.length > 0)
      await page.evaluate(`setFont(${JSON.stringify(needLoadFontList)})`)

    await page.waitForNetworkIdle()
    const element = await page.$('#background-page')
    await page.evaluate(() => document.fonts.ready)

    return (
      segment.image(await element.screenshot({
        encoding: 'binary',
      }), 'image/png')
    )
  }
  catch (e) {
    logger.error('puppeteer 渲染失败: ', e)
    return `渲染失败${e.message}`
  }
  finally {
    page?.close()
  }
}

export async function renderRandom(ctx: Context, sort: string, systemInfo: SystemInfo['random'], botUid: string) {
  return ctx.http.axios<{ pic: string[] }>({
    method: 'get',
    url: `https://iw233.cn/api.php?sort=${sort}&type=json`,
    headers: {
      referer: 'https://weibo.com/',
    },
  }).then((res) => {
    return ctx.http.axios({
      method: 'get',
      url: res.data.pic[0],
      responseType: 'arraybuffer',
      headers: {
        referer: 'https://weibo.com/',
      },
    }).then(async (resp) => {
      // eslint-disable-next-line n/prefer-global/buffer
      const imageBase64 = Buffer.from(resp.data, 'binary').toString('base64')
      let page: Page
      try {
        const { statusFontsDir } = GeneratePath.getInstance(ctx.baseDir).getGeneratePathData()
        let needLoadFontList = await getFontsList(statusFontsDir, logger)
        needLoadFontList = needLoadFontList.filter(font => ['Poppins-Regular ttf', 'NotoSansSC-Regular otf'].includes(font.fontFamily))

        page = await ctx.puppeteer.page()
        await page.setViewport({ width: 1920 * 2, height: 1080 * 2 })

        await page.goto(`${pathToFileURL(resolve(__dirname, '../random/template.html'))}`)
        await page.evaluate(`action(${JSON.stringify(systemInfo)}, '${imageBase64}', '${botUid}')`)
        if (needLoadFontList.length > 0)
          await page.evaluate(`setFont(${JSON.stringify(needLoadFontList)})`)

        await page.waitForNetworkIdle()
        const element = await page.$('#app')
        await page.evaluate(() => document.fonts.ready)
        return (
          segment.image(await element.screenshot({
            encoding: 'binary',
          }), 'image/png')
        )
      }
      catch (e) {
        logger.error('puppeteer 渲染失败: ', e)
        return `puppeteer 渲染失败${e.message}`
      }
      finally {
        page?.close()
      }
    })
  }).catch((err) => {
    logger.error('render random error:', err)
    if (['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'ECONNABORTED', 'read ECONNRESET'].includes(err.code))
      return '渲染失败: 请求超时, 网络错误'
    return `渲染失败: ${err.message}`
  })
}
