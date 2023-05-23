/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-03 12:57:50
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-05-23 11:10:43
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\bilibili\dynamic\common.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import * as crypto from 'node:crypto'
import type { Argv, Channel, Context, Dict, Quester } from 'koishi'
import type {
  BilibiliDynamicItem,
  BilibiliUserInfoApiData,
  DynamicNotifiction,
} from '../model'
import { getDynamic } from '../utils'
import { renderFunction } from './render'
import type { IConfig } from '.'
import { logger } from '.'

// 每次请求生成 w_rid 参数
function wrid(uid: string | number) {
  const wts = Math.floor(Date.now() / 1000).toString() // 获得时间戳
  const c = '72136226c6a73669787ee4fd02a74c27'
  const b = `mid=${uid}&platform=web&token=&web_location=1550101`
  const a = `${b}&wts=${wts}${c}`
  return crypto.createHash('md5').update(a).digest('hex')
}

async function fetchUserInfo(
  uid: string,
  http: Quester,
): Promise<BilibiliUserInfoApiData['data']> {
  let res = await http.get(
    'https://api.bilibili.com/x/space/wbi/acc/info',
    {
      params: {
        mid: uid,
        token: '',
        platform: 'web',
        web_location: 1550101,
        w_rid: wrid(uid),
        wts: Math.floor(Date.now() / 1000),
      },
      headers: {
        'Referer': `https://space.bilibili.com/${uid}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'Origin': 'https://space.bilibili.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
      },
    },
  )

  // 对接 code -509 异常返回
  if (res.code === undefined) {
    const regex = /(?<=})\s*(?={)/g
    const jsonStrings = res.split(regex)
    if (+JSON.parse(jsonStrings[0]).code === -509)
      res = JSON.parse(jsonStrings[1])
  }
  if (res.code !== 0 && res.code !== -403)
    throw new Error(`获取 ${uid} 信息失败: [code: ${res.code}, message: ${res.message}]`)
  return res.data || {}
}

export async function bilibiliAdd(
  { session }: Argv<never, 'id' | 'guildId' | 'platform' | 'bilibili', any>,
  uid: string,
  list: Dict<
    [
      Pick<Channel, 'id' | 'guildId' | 'platform' | 'bilibili'>,
      DynamicNotifiction,
    ][]
  >,
  ctx: Context,
) {
  if (
    session.channel.bilibili.dynamic.find(
      notification => notification.bilibiliId === uid || +notification.bilibiliId === +uid,
    )
  )
    return '该用户已在监听列表中。'

  try {
    const { name } = await fetchUserInfo(uid, ctx.http)
    uid = String(uid)
    const notification: DynamicNotifiction = {
      botId: `${session.platform}:${session.bot.userId || session.bot.selfId}`,
      bilibiliId: uid,
      bilibiliName: name || uid,
    }
    session.channel.bilibili.dynamic.push(notification);
    (list[uid] ||= []).push([
      {
        id: session.channel.id,
        guildId: session.channel.guildId,
        platform: session.platform,
        bilibili: session.channel.bilibili,
      },
      notification,
    ])
    return `成功添加 up主: ${name || uid}`
  }
  catch (e) {
    logger.error(e)
    return `请求失败，请检查 uid 是否正确或重试，${e.message}`
  }
}

export async function bilibiliRemove(
  { session }: Argv<never, 'id' | 'guildId' | 'platform' | 'bilibili', any>,
  uid: string,
  list: Dict<
    [
      Pick<Channel, 'id' | 'guildId' | 'platform' | 'bilibili'>,
      DynamicNotifiction,
    ][]
  >,
) {
  uid = String(uid)
  const { channel } = session
  const index = channel.bilibili.dynamic.findIndex(
    notification => notification.bilibiliId === uid || +notification.bilibiliId === +uid,
  )
  if (index === -1)
    return '该用户不在监听列表中。'
  channel.bilibili.dynamic.splice(index, 1)
  const listIndex = list[uid].findIndex(
    ([{ id, guildId, platform }, notification]) => {
      return (
        channel.id === id
        && channel.guildId === guildId
        && channel.platform === platform
        && notification.bilibiliId === uid
      )
    },
  )
  if (listIndex === -1)
    throw new Error('Data is out of sync.')
  const name = list[uid][listIndex]?.[1].bilibiliName
  delete list[uid]
  return `成功删除 up主: ${name}`
}

export async function bilibiliList({
  session,
}: Argv<never, 'id' | 'guildId' | 'platform' | 'bilibili', any, any>) {
  if (session.channel.bilibili.dynamic.length === 0)
    return '监听列表为空。'
  return session.channel.bilibili.dynamic
    .map(
      notification =>
        `- ${notification.bilibiliId} ${notification.bilibiliName}`,
    )
    .join('\n')
}

export async function bilibiliSearch(
  _: Argv<never, 'id' | 'guildId' | 'platform' | 'bilibili', any>,
  uid: string,
  _list: Dict<
    [
      Pick<Channel, 'id' | 'guildId' | 'platform' | 'bilibili'>,
      DynamicNotifiction,
    ][]
  >,
  ctx: Context,
  config: IConfig,
) {
  try {
    const { data } = await getDynamic(ctx.http, uid)
    const items = data.items as BilibiliDynamicItem[]

    if (items.length === 0)
      return '该 up 没有动态'

    const dynamic
      = items[0].modules.module_tag?.text === '置顶' ? items[1] : items[0]

    return renderFunction(ctx, dynamic, config)
  }
  catch (e) {
    logger.error(`${uid} 动态获取失败: [${e}]`)
    return `动态获取失败${e.message}`
  }
}
