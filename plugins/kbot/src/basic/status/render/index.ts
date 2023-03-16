/*
* @Author: Kabuda-czh
* @Date: 2023-03-13 17:14:23
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-03-16 19:43:49
 * @FilePath: \KBot-App\plugins\kbot\src\basic\status\render\index.ts
* @Description:
*
* Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
*/

import { resolve } from 'node:path'
import type { Context } from 'koishi'
import { segment } from 'koishi'
import type { Page } from 'puppeteer-core'
import type { SystemInfo } from '../utils'
import { writeBlobToFile } from '../utils'
import { logger } from '..'

export async function renderHtml(ctx: Context, systemInfo: SystemInfo) {
  let page: Page
  try {
    page = await ctx.puppeteer.page()
    await page.setViewport({ width: 1920 * 2, height: 1080 * 2 })
    await page.goto(`file:///${resolve(__dirname, '../neko/template.html')}`)
    await page.evaluate(`action(${JSON.stringify(systemInfo)})`)
    const element = await page.$('#background-page')
    await page.waitForNetworkIdle()
    return (
      segment.image(await element.screenshot({
        encoding: 'binary',
      }), 'image/png')
    )
  }
  catch (e) {
    console.log(e)
    logger.error('puppeteer 渲染失败: ', e.message)
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
      const imageBase64 = Buffer.from(resp.data, 'binary').toString('base64')
      writeBlobToFile(resp.data, new Date().toLocaleString().replace(/[/:]/g, '-'))
      const botQQ = botUid.split(':')[1]
      let page: Page
      try {
        page = await ctx.puppeteer.page()
        await page.setViewport({ width: 1920 * 2, height: 1080 * 2 })
        await page.goto(`file:///${resolve(__dirname, '../random/template.html')}`)
        await page.evaluate(`action(${JSON.stringify(systemInfo)}, '${imageBase64}', '${botQQ}')`)
        const element = await page.$('#app')
        await page.waitForNetworkIdle()
        return (
          segment.image(await element.screenshot({
            encoding: 'binary',
          }), 'image/png')
        )
      }
      catch (e) {
        logger.error('puppeteer 渲染失败: ', e.message)
        return `puppeteer 渲染失败${e.message}`
      }
      finally {
        page?.close()
      }
    })
  }).catch((err) => {
    logger.error(err.code, err.message)
    if (['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'ECONNABORTED', 'read ECONNRESET'].includes(err.code))
      return '渲染失败: 请求超时, 网络错误'
    return `渲染失败: ${err.message}`
  })
}
