/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-27 13:24:23
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-03-16 10:53:14
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\twitter\utils\reGetToken.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import * as fs from 'node:fs'
import { resolve } from 'node:path'
import type { Context, Logger } from 'koishi'
import type { Page } from 'puppeteer-core'

export async function getTwitterToken(ctx: Context, logger: Logger) {
  let page: Page, cookie: any, gtCookie: string

  try {
    logger.info('token 获取中...')
    page = await ctx.puppeteer.page()

    // 监听 request 事件
    const onRequest = (request: any) => {
      const guestToken = request.headers()['x-guest-token']
      if (guestToken) {
        gtCookie = guestToken
        page.removeAllListeners('request')
      }
    }

    page.on('request', onRequest)

    await page.goto('https://twitter.com/')
    await page.waitForNetworkIdle()

    fs.writeFileSync(
      resolve(__dirname, '../../../../../../public/kbot/twitter/cookie.json'),
      JSON.stringify({ cookies: gtCookie }),
    )

    ctx.http.config.headers['x-guest-token'] = gtCookie

    cookie = { cookies: gtCookie }

    logger.info('token 获取成功: ', gtCookie)
  }
  catch (error) {
    logger.error('token 获取失败: ', error.message)
    return { cookies: '' }
  }
  finally {
    page?.close()
  }

  return cookie
}
