/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-03 12:57:50
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-04-12 15:56:29
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\bilibili\dynamic\common.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
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

const fetchUserInfo = async (
  uid: string,
  http: Quester,
): Promise<BilibiliUserInfoApiData['data']> => {
  const res = await http.get(
    `https://api.bilibili.com/x/space/acc/info?mid=${uid}&gaia_source=m_station`,
    {
      headers: {
        Referer: `https://space.bilibili.com/${uid}/dynamic`,
      },
    },
  )
  if (res.code !== 0)
    throw new Error(`获取 ${uid} 信息失败: [${res}]`)
  return res.data
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
      notification => notification.bilibiliId === uid,
    )
  )
    return '该用户已在监听列表中。'

  try {
    const { name } = await fetchUserInfo(uid, ctx.http)
    const notification: DynamicNotifiction = {
      botId: `${session.platform}:${session.bot.userId || session.bot.selfId}`,
      bilibiliId: uid,
      bilibiliName: name,
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
    return `成功添加 up主: ${name}`
  }
  catch (e) {
    logger.error(e)
    return `请求失败，请检查 uid 是否正确或重试${e.message}`
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
  const { channel } = session
  const index = channel.bilibili.dynamic.findIndex(
    notification => notification.bilibiliId === uid,
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
