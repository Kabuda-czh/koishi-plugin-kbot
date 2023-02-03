/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:44:05
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-03 09:57:11
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\bilibili\url.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { Context, Logger, Quester, Schema } from 'koishi'
import { toAvid } from './utils'

// av -> 6 avid -> 8 bv -> 9
const VIDEO_REGEX = /(((https?:\/\/)?(www.|m.)?bilibili.com\/(video\/)?)?((av|AV)(\d+)|((BV|bv)1[1-9A-NP-Za-km-z]{9})))/
// value -> 4
const B23_REGEX = /((https?:\/\/)?(b23.tv|bili2233.cn)\/(((av|ep|ss)\d+)|BV1[1-9A-NP-Za-km-z]{9}|\S{6,7}))/

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

const logger = new Logger('KBot-bilibili-url')

export function apply(ctx: Context) {
  ctx.middleware(async ({ content }, next) => {
    try {
      const avid = await testVideo(content, ctx.http)
      if (avid) return next(async () => await render(avid, ctx.http))
    } catch (e) {
      logger.error('请求时发生异常: ', e)
    }
    return next()
  })
}

async function testVideo(content: string, http: Quester): Promise<string> {
  let match: RegExpExecArray
  if (match = B23_REGEX.exec(content)) {
    const url = await parseB23(match[4], http)
    return await testVideo(url, http)
  } else if (match = VIDEO_REGEX.exec(content)) {
    return match[8] || toAvid(match[9]).toString()
  }
}

async function parseB23(value: string, http: Quester): Promise<string> {
  const result = await http.axios(`https://b23.tv/${value}`, {
    maxRedirects: 0,
    validateStatus: status => status === 302,
  })
  return result.headers['location']
}

async function render(avid: string, http: Quester) {
  const { data } = await http.get(`https://api.bilibili.com/x/web-interface/view?aid=${avid}`)
  const up = data.staff?.map(staff => staff.name).join('/') || data.owner.name
  return `<image url="${data.pic}"/>
标题: ${data.title}
UP 主: ${up}
点赞: ${data.stat.like} | 硬币: ${data.stat.coin} | 收藏: ${data.stat.favorite}
播放: ${data.stat.view} | 弹幕: ${data.stat.danmaku} | 评论: ${data.stat.reply}
简介: ${data.desc.length > 50 ? data.desc.slice(0, 50) + '...' : data.desc}
https://bilibili.com/video/av${avid}`
}