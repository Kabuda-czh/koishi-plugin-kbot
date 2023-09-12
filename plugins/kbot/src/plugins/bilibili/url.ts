/* eslint-disable no-cond-assign */
/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:44:05
 * @LastEditors: Kabuda-czh 634469564@qq.com
 * @LastEditTime: 2023-09-12 20:25:29
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\bilibili\url.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import type { Context, Next, Quester } from 'koishi'
import { Logger, Schema, segment } from 'koishi'
import { toAvid } from './utils'

const sendedTimes: Record<string, NodeJS.Timeout> = {}

// av -> 6 avid -> 8 bv -> 9
const VIDEO_REGEX
  = /(((https?:\/\/)?(www.|m.)?bilibili.com\/(video\/)?)?((av|AV)(\d+)|((BV|bv)1[1-9A-NP-Za-km-z]{9})))/
// value -> 4
const B23_REGEX
  = /((https?:\/\/)?(b23.tv|bili2233.cn)\/(((av|ep|ss)\d+)|BV1[1-9A-NP-Za-km-z]{9}|\S{6,7}))/

export interface IConfig {}

export const Config: Schema<IConfig> = Schema.object({})

const logger = new Logger('KBot-bilibili-url')

async function processContent(content: string, channelId: string, http: Quester, next: Next) {
  try {
    const avid = await testVideo(content, http)
    if (avid) {
      logger.success(`成功解析 avid: 「${avid}」`)
      return next(async () => await render(avid, channelId, http))
    }
  }
  catch (e) {
    logger.error('请求时发生异常: ', e)
  }
}

export function apply(ctx: Context) {
  ctx.middleware(async ({ content, channelId }, next) => {
    const json = segment.select(content, 'json')
    if (json.length > 0) {
      content = segment.select(content, 'json')[0]?.attrs?.data.replace(/\\\//g, '/')
      return await processContent(content, channelId, ctx.http, next)
    }
    else if ((VIDEO_REGEX.test(content) || B23_REGEX.test(content)) && segment.select(content, 'image').length === 0) {
      return await processContent(content, channelId, ctx.http, next)
    }
    return next()
  })
}

async function testVideo(content: string, http: Quester): Promise<string> {
  let match: RegExpExecArray
  if ((match = B23_REGEX.exec(content))) {
    const url = await parseB23(match[4], http)
    return await testVideo(url, http)
  }
  else if ((match = VIDEO_REGEX.exec(content))) {
    return match[8] || toAvid(match[9]).toString()
  }
}

async function parseB23(value: string, http: Quester): Promise<string> {
  const result = await http.axios(`https://b23.tv/${value}`, {
    maxRedirects: 0,
    validateStatus: status => status === 302,
  })
  return result.headers.location
}

async function render(avid: string, channelId: string, http: Quester) {
  if (`${avid}-${channelId}` in sendedTimes)
    return

  const { data } = await http.get(
    `https://api.bilibili.com/x/web-interface/view?aid=${avid}`,
  )
  const up
    = data?.staff?.map(staff => staff.name).join('/') || data.owner.name

  if (data.desc.includes('\n'))
    data.desc = data.desc.replaceAll(/\n/g, '')

  if (Object.keys(sendedTimes).length > 3) {
    const id = Object.keys(sendedTimes)[0]
    clearTimeout(sendedTimes[id])
    delete sendedTimes[id]
  }

  sendedTimes[`${avid}-${channelId}`] = setTimeout(() => {
    delete sendedTimes[`${avid}-${channelId}`]
  }, 30 * 1000)

  const imageData = await http.get<string>(data.pic, {
    responseType: 'arraybuffer',
  }).then((res) => {
    // eslint-disable-next-line n/prefer-global/buffer
    const base64 = Buffer.from(res, 'binary').toString('base64')
    return `data:image/jpeg;base64,${base64}`
  })
    .catch(_err => data.pic)

  return `<image url="${imageData}"/>
标题: ${data.title}
UP 主: ${up}
点赞: ${data.stat.like} | 硬币: ${data.stat.coin} | 收藏: ${data.stat.favorite}
播放: ${data.stat.view} | 弹幕: ${data.stat.danmaku} | 评论: ${data.stat.reply}
简介: ${data.desc.length > 50 ? `${data.desc.slice(0, 50)}...` : data.desc}
https://bilibili.com/video/av${avid}`
}
