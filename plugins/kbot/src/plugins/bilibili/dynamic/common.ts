/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-03 12:57:50
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-07-24 12:00:30
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\bilibili\dynamic\common.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import * as crypto from 'node:crypto'
import fs from 'node:fs'
import type { Argv, Channel, Context, Dict, Quester } from 'koishi'
import type {
  BilibiliDynamicItem,
  BilibiliUserInfoApiData,
  BilibiliUserNavApiData,
  DynamicNotifiction,
} from '../model'
import { getDynamic } from '../utils'
import GeneratePath from '../../../config'
import { BilibiliDynamicType } from '../enum'
import { renderFunction } from './render'
import type { IConfig } from '.'
import { logger } from '.'

async function _getSalt(http: Quester, cookieString: string): Promise<string> {
  const response = await http.get<BilibiliUserNavApiData>(BilibiliDynamicType.UserNav, { headers: { cookie: cookieString } })
  const data = response.data
  const { img_url, sub_url } = data.wbi_img

  const img_key = (/wbi\/(.*?)\.png/g.exec(img_url))[1] || ''
  const sub_key = (/wbi\/(.*?)\.png/g.exec(sub_url))[1] || ''

  const array = Array.from(img_key + sub_key)
  const order = [46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34, 44, 52]

  const salt = order.map(i => array[i]).join('').slice(0, 32)
  return salt
}

async function _encrypt_w_rid(params: string | Record<string, string>, http: Quester, cookieString: string): Promise<[string, string]> {
  const wts = Math.floor(Date.now() / 1000).toString() // 获得时间戳

  let paramsList: string[]

  if (typeof params === 'string') {
    paramsList = (`${params}&wts=${wts}`).split('&')
  }
  else if (typeof params === 'object') {
    params.wts = wts
    paramsList = Object.entries(params).map(([key, value]) => `${key}=${value}`)
  }
  else {
    throw new TypeError(`Invalid type of params: ${typeof params}`)
  }

  paramsList.sort()

  const salt = await _getSalt(http, cookieString)

  const hash = crypto.createHash('md5')
  const w_rid = hash.update(paramsList.join('&') + salt).digest('hex')
  return [w_rid, wts]
}

async function fetchUserInfo(
  uid: string,
  ctx: Context,
): Promise<BilibiliUserInfoApiData['data']> {
  let cookie
  try {
    const { bilibiliCookiePath } = GeneratePath.getInstance(ctx.baseDir).getGeneratePathData()
    cookie = JSON.parse(
      await fs.promises.readFile(
        bilibiliCookiePath,
        'utf-8',
      ),
    )
  }
  catch (e) {
    logger.error(`Failed to get cookie info. ${e}`)
    throw new Error('cookie信息未找到, 请使用 --ck 或 --cookie 更新cookie信息')
  }

  const cookieString = Object.entries(cookie)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ')

  const defaultParams = {
    token: '',
    platform: 'web',
    web_location: '1550101',
    mid: uid,
  }

  const [w_rid, wts] = await _encrypt_w_rid(defaultParams, ctx.http, cookieString)

  let res = await ctx.http.axios<BilibiliUserInfoApiData>(
    BilibiliDynamicType.UserInfo,
    {
      method: 'GET',
      params: {
        ...defaultParams,
        w_rid,
        wts,
      },
      headers: {
        'Referer': `https://space.bilibili.com/${uid}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'Origin': 'https://space.bilibili.com',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        'Cookie': cookieString,
      },
    },
  )

  // 对接 code -509 异常返回
  if (res.data.code === undefined) {
    const regex = /(?<=})\s*(?={)/g
    const jsonStrings = (res.data as unknown as string).split(regex)
    if (+JSON.parse(jsonStrings[0]).code === -509)
      res = JSON.parse(jsonStrings[1])
  }
  if (res.data.code !== 0)
    throw new Error(`[code: ${res.data.code}, message: ${res.data.message}] 请更新 cookie 信息 或 联系管理员`)

  return res.data.data
}

export async function bilibiliAdd(
  { session }: Argv<never, 'id' | 'guildId' | 'platform' | 'bilibili', any>,
  up: {
    uid: string
    upName: string
  },
  list: Dict<
    [
      Pick<Channel, 'id' | 'guildId' | 'platform' | 'bilibili'>,
      DynamicNotifiction,
    ][]
  >,
  ctx: Context,
) {
  let { uid, upName } = up
  if (
    session.channel.bilibili.dynamic.find(
      notification => notification.bilibiliId === uid || +notification.bilibiliId === +uid,
    )
  )
    return '该用户已在监听列表中。'

  try {
    let userData: BilibiliUserInfoApiData['data']
    if (uid === upName)
      userData = await fetchUserInfo(uid, ctx)
    if (userData)
      upName = userData.name || upName
    uid = String(uid)
    const notification: DynamicNotifiction = {
      botId: `${session.platform}:${session.bot.userId || session.bot.selfId}`,
      bilibiliId: uid,
      bilibiliName: upName || uid,
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
    return `成功添加 up主: ${upName || uid}`
  }
  catch (e) {
    logger.error(e)
    return `请求失败，请检查 uid 是否正确或重试，${e.message}`
  }
}

export async function bilibiliBatch(
  { session }: Argv<never, 'id' | 'guildId' | 'platform' | 'bilibili', any>,
  up: {
    uid: string[]
    upName: string[]
  },
  list: Dict<
    [
      Pick<Channel, 'id' | 'guildId' | 'platform' | 'bilibili'>,
      DynamicNotifiction,
    ][]
  >,
  ctx: Context,
) {
  const { uid: uids, upName: upNames } = up

  const result: string[] = []
  const error: string[] = []
  for (let i = 0; i < uids.length; i++) {
    let uid = uids[i]
    let upName = upNames[i]

    if (
      session.channel.bilibili.dynamic.find(
        notification => notification.bilibiliId === uid || +notification.bilibiliId === +uid,
      )
    )
      continue

    try {
      const userData = await fetchUserInfo(uid, ctx)
      upName = userData.name || upName
      uid = String(uid)
      const notification: DynamicNotifiction = {
        botId: `${session.platform}:${session.bot.userId || session.bot.selfId}`,
        bilibiliId: uid,
        bilibiliName: upName || uid,
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
      result.push(`${upName || uid}`)
    }
    catch (e) {
      logger.error(e)
      error.push(`${upName || uid}「${e.message}」`)
    }
  }

  if (result.length)
    return `成功添加 up主: \n${result.join('\n')}`
  else if (error.length)
    return `添加以下 up主 失败: \n${error.join('\n')}`
  else
    return '所有用户已在监听列表中。'
}

export async function bilibiliRemove(
  { session }: Argv<never, 'id' | 'guildId' | 'platform' | 'bilibili', any>,
  up: {
    uid: string
    upName: string
  },
  list: Dict<
    [
      Pick<Channel, 'id' | 'guildId' | 'platform' | 'bilibili'>,
      DynamicNotifiction,
    ][]
  >,
) {
  let { uid } = up

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
        `- ${notification.bilibiliId} 「${notification.bilibiliName}」`,
    )
    .join('\n')
}

export async function bilibiliSearch(
  _: Argv<never, 'id' | 'guildId' | 'platform' | 'bilibili', any>,
  up: {
    uid: string
    upName: string
  },
  _list: Dict<
    [
      Pick<Channel, 'id' | 'guildId' | 'platform' | 'bilibili'>,
      DynamicNotifiction,
    ][]
  >,
  ctx: Context,
  config: IConfig,
) {
  const { uid } = up
  try {
    const { data } = await getDynamic(ctx, uid, logger)
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
