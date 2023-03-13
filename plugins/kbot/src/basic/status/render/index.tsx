/*
* @Author: Kabuda-czh
* @Date: 2023-03-13 17:14:23
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-03-13 18:30:13
 * @FilePath: \KBot-App\plugins\kbot\src\basic\status\render\index.tsx
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
    await page.waitForNetworkIdle()
    await page.evaluate(`action(${JSON.stringify(systemInfo)})`)
    const element = await page.$('#background-page')
    return (
      segment.image(await element.screenshot({
        encoding: 'binary',
      }), 'image/png')
    )
  }
  catch (e) {
    logger.error('状态渲染失败: ', e)
    return `渲染失败${e.message}`
  }
  finally {
    page?.close()
  }
}

export async function renderRandom(ctx: Context, sort: string, session, systemInfo: SystemInfo) {
  console.log(sort)
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
    }).then((resp) => {
      const imageBase64 = Buffer.from(resp.data, 'binary').toString('base64')
      writeBlobToFile(resp.data, 'test')
      // return segment.image(resp.data, 'binary')
      const radius = 50
      const circumference = radius * 2 * Math.PI
      return <html>
        <style>{`
          * {
            margin: 0;
            padding: 0;
          }

          #app {
            width: 1280px;
            height: 100%;
            position: relative;
          }

          #image {
            width: 100%;
            height: 100%;
            Object-fit: cover;
            position: absolute;
            top: 0;
            left: 0;
          }

          .info_card {
            width: 100%;
            margin-left: 40px;
            margin-right: 40px;
            padding: 20px;
            background-color: rgba(255, 255, 255, 0.5);
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
          }
        `}
        </style>
        <div id="app">
          <div class="info_card user_info">
            <div class="user_info_avatar">
              <img src="https://q1.qlogo.cn/g?b=qq&nk=123456&s=640" alt="avatar" />
            </div>
            <div>
              <div class="user_info_name">Kabuda-czh</div>
              <hr />
              <div>
                <p>KBot {systemInfo.footer}</p>
                <p>{new Date().toLocaleString()} | {systemInfo.platform}</p>
              </div>
            </div>
          </div>
          <div class="info_card cpu_ram_info">
            <div>
              <svg viewBox="0 0 100 100" width="100" height="100">
                <circle
                  cx="50"
                  cy="50"
                  r="50"
                  fill="none"
                  strokeWidth="10"
                  stroke="#ccc"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="50"
                  fill="none"
                  strokeWidth="10"
                  stroke="#f00"
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={circumference - 80 / 100 * circumference}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          <div class="info_card disk_info"></div>
          <div class="info_card sys_info"></div>
          <footer></footer>
        </div>
      </html>
    })
  }).catch((err) => {
    return `渲染失败: ${err.message}`
  })
}
