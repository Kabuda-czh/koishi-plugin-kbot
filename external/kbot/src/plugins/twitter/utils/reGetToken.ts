/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-27 13:24:23
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-07-11 11:28:38
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\twitter\utils\reGetToken.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import * as fs from 'node:fs'
import type { Context, Logger } from 'koishi'
import type { Page } from 'puppeteer-core'
import GeneratePath from '../../../config'

export async function getTwitterToken(ctx: Context, logger: Logger) {
  let page: Page, cookie: any, gtCookie: string

  try {
    const { twitterCookiePath } = GeneratePath.getInstance(ctx.baseDir).getGeneratePathData()
    logger.info('token 获取中...')
    page = await ctx.puppeteer.page()

    // 监听 request 事件
    const onRequest = (request: any) => {
      const guestToken = request.headers().Cookie
      if (guestToken !== undefined) {
        gtCookie = guestToken
        page.removeAllListeners('request')
      }
    }

    page.on('request', onRequest)

    await page.goto('https://twitter.com/')
    await page.waitForNetworkIdle()

    const cookieRegex = /([^=;\s]+)=([^=;\s]*)/g

    if (!cookieRegex.test(gtCookie) && !gtCookie)
      throw new Error('token 获取失败, 请检查是否在浏览器中正确登录 Twitter 账户')

    const cookieObject: {
      ct0: string
      auth_token: string
    } = {
      ct0: '',
      auth_token: '',
    }

    gtCookie.match(cookieRegex)?.forEach((cookie) => {
      const [key, value] = cookie.split('=')
      if (['ct0', 'auth_token'].includes(key))
        cookieObject[key] = value
    })

    await fs.promises.writeFile(
      twitterCookiePath,
      JSON.stringify({ cookieString: gtCookie, authCookie: { ...cookieObject } }),
    )

    ctx.http.config.headers['x-csrf-token'] = cookieObject.ct0
    ctx.http.config.headers.Cookie = gtCookie

    cookie = { cookieString: gtCookie, authCookie: { ...cookieObject } }

    logger.info('token 获取成功: ', cookieObject)
  }
  catch (error) {
    logger.error('token 获取失败: ', error.message)
    return { cookieString: '', authCookie: {} }
  }
  finally {
    page?.close()
  }

  return cookie
}
