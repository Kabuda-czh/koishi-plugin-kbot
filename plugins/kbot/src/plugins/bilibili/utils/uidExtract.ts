/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-03 14:41:21
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-07-11 11:20:45
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\bilibili\utils\uidExtract.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import type { Argv, Context, Logger } from 'koishi'
import { b23Extract } from './b23Extract'
import { searchUser } from './biliRequest'

export function isNumberOrNumberString(text: string) {
  return text !== '' && +text * 0 === 0
}

export async function uidExtract(
  text: string,
  { session }: Argv<never, 'id' | 'guildId' | 'platform' | 'bilibili'>,
  logger: Logger,
  ctx: Context,
) {
  if (typeof text !== 'string')
    return ''

  if (session.channel.bilibili.dynamic.length !== 0) {
    session.channel.bilibili.dynamic.forEach((item) => {
      if (isNumberOrNumberString(text)) {
        if (item.bilibiliId === text)
          return item.bilibiliId
      }
      else {
        if (item.bilibiliName === text.replace(/^['"“”‘’]+|['"“”‘’]+$/g, ''))
          return item.bilibiliId
      }
    })
  }

  let b23URL = ''

  if (text.includes('b23.tv') || text.includes('b23.wtf'))
    b23URL = await b23Extract(text, ctx.http)
  const message = b23URL || text

  const bilibiliURLRegex = /^[0-9]*$|bilibili.com\/([0-9]*)/
  let uid = ''
  const uidMatch = bilibiliURLRegex.exec(message)
  if (uidMatch) {
    uid = uidMatch[1] || uidMatch[0]
    return uid
  }
  else if (message.toLocaleUpperCase().startsWith('UID:')) {
    const uidMatch = /^\d+/.exec(message.slice(4).trim())
    return uidMatch ? uidMatch[0] : ''
  }
  else {
    const keyword = message.replace(/^['"“”‘’]+|['"“”‘’]+$/g, '')
    const resp = await searchUser(ctx, keyword, logger)
    if (resp?.numResults) {
      resp.result.forEach((item) => {
        if (item.uname === keyword)
          uid = item.mid
      })
    }
  }
  return uid
}
