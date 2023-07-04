/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-03 12:57:50
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-07-03 11:00:14
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\twitter\dynamic\common.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import fs from 'node:fs'
import type { Argv, Channel, Context, Dict } from 'koishi'
import type { DynamicNotifiction } from '../model'
import { getTwitterTweets } from '../utils'
import { twitterCookiePath, twitterDir } from '../../../config'
import { renderFunction } from './render'
import { logger } from '.'
import type { IConfig } from '.'

export async function twitterAdd(
  { session }: Argv<never, 'id' | 'guildId' | 'platform' | 'twitter', any>,
  twitter: {
    twitterId: string
    twitterName: string
    twitterRestId: string
  },
  list: Dict<
    [
      Pick<Channel, 'id' | 'guildId' | 'platform' | 'twitter'>,
      DynamicNotifiction,
    ][]
  >,
  _ctx: Context,
) {
  const { twitterId, twitterName, twitterRestId } = twitter

  if (
    session.channel.twitter.dynamic.find(
      notification => notification.twitterRestId === twitterRestId,
    )
  )
    return '该用户已在监听列表中。'

  try {
    const notification: DynamicNotifiction = {
      botId: `${session.platform}:${session.bot.userId || session.bot.selfId}`,
      twitterId,
      twitterName,
      twitterRestId,
    }
    session.channel.twitter.dynamic.push(notification);
    (list[twitterRestId] ||= []).push([
      {
        id: session.channel.id,
        guildId: session.channel.guildId,
        platform: session.platform,
        twitter: session.channel.twitter,
      },
      notification,
    ])
    return `成功添加: ${twitterName}`
  }
  catch (e) {
    logger.error(`添加推特用户 ${twitterId} 失败: [${e}]`)
    return `请求失败，请检查 id 是否正确或重试${e}`
  }
}

export async function twitterBatch(
  { session }: Argv<never, 'id' | 'guildId' | 'platform' | 'twitter', any>,
  twitter: {
    twitterId: string[]
    twitterName: string[]
    twitterRestId: string[]
  },
  list: Dict<
    [
      Pick<Channel, 'id' | 'guildId' | 'platform' | 'twitter'>,
      DynamicNotifiction,
    ][]
  >,
  _ctx: Context,
) {
  const { twitterId: twitterIds, twitterName: twitterNames, twitterRestId: twitterRestIds } = twitter

  const result = []
  const error = []

  for (let i = 0; i < twitterIds.length; i++) {
    const twitterId = twitterIds[i].trim()
    const twitterName = twitterNames[i]
    const twitterRestId = twitterRestIds[i]

    if (
      session.channel.twitter.dynamic.find(
        notification => notification.twitterRestId === twitterRestId,
      )
    )
      continue

    try {
      const notification: DynamicNotifiction = {
        botId: `${session.platform}:${session.bot.userId || session.bot.selfId}`,
        twitterId,
        twitterName,
        twitterRestId,
      }
      session.channel.twitter.dynamic.push(notification);
      (list[twitterRestId] ||= []).push([
        {
          id: session.channel.id,
          guildId: session.channel.guildId,
          platform: session.platform,
          twitter: session.channel.twitter,
        },
        notification,
      ])
      result.push(`${twitterName}`)
    }
    catch (e) {
      logger.error(`添加推特用户 ${twitterId} 失败: [${e}]`)
      error.push(`${twitterId}: [${e}]`)
    }
  }

  if (result.length)
    return `成功添加: \n${result.join('\n')}`
  else if (error.length)
    return `以下用户添加失败: \n${error.join('\n')}`
  else
    return '所有用户已在监听列表中。'
}

export async function twitterRemove(
  { session }: Argv<never, 'id' | 'guildId' | 'platform' | 'twitter', any>,
  twitter: { twitterId: string; twitterName: string; twitterRestId: string },
  list: Dict<
    [
      Pick<Channel, 'id' | 'guildId' | 'platform' | 'twitter'>,
      DynamicNotifiction,
    ][]
  >,
) {
  const { channel } = session
  const { twitterRestId } = twitter

  const index = channel.twitter.dynamic.findIndex(
    notification => notification.twitterRestId === twitterRestId,
  )
  if (index === -1)
    return '该用户不在监听列表中。'
  channel.twitter.dynamic.splice(index, 1)
  const listIndex = list[twitterRestId].findIndex(
    ([{ id, guildId, platform }, notification]) => {
      return (
        channel.id === id
        && channel.guildId === guildId
        && channel.platform === platform
        && notification.twitterRestId === twitterRestId
      )
    },
  )
  if (listIndex === -1)
    throw new Error('Data is out of sync.')
  const name = list[twitterRestId][listIndex]?.[1].twitterName
  delete list[twitterRestId]
  return `成功删除: ${name}`
}

export async function twitterList({
  session,
}: Argv<never, 'id' | 'guildId' | 'platform' | 'twitter', any, any>) {
  if (session.channel.twitter.dynamic.length === 0)
    return '监听列表为空。'
  return session.channel.twitter.dynamic
    .map(
      notification =>
        `- @${notification.twitterId} 「${notification.twitterName}」`,
    )
    .join('\n')
}

export async function twitterSearch(
  _: Argv<never, 'id' | 'guildId' | 'platform' | 'twitter', any>,
  twitter: { twitterId: string; twitterName: string; twitterRestId: string },
  _list: Dict<
    [
      Pick<Channel, 'id' | 'guildId' | 'platform' | 'twitter'>,
      DynamicNotifiction,
    ][]
  >,
  ctx: Context,
  config: IConfig,
) {
  const { twitterRestId } = twitter
  try {
    const entries = await getTwitterTweets(twitterRestId, ctx, logger)

    if (!entries || entries?.length === 0)
      return '该用户没有动态。'

    return renderFunction(ctx, entries[0], config, false)
  }
  catch (e) {
    logger.error(`推特动态获取失败: ${e.message}`)
    return `动态获取失败${e}`
  }
}

export async function twitterCookie(
  {
    session,
    options,
  }:
  Argv<never, 'id' | 'guildId' | 'platform' | 'twitter', any, {
    cookie: string
  }>,
  _twitter: { twitterId: string; twitterName: string; twitterRestId: string },
  _list: Dict<
    [
      Pick<Channel, 'id' | 'guildId' | 'platform' | 'twitter'>,
      DynamicNotifiction,
    ][]
  >,
  ctx: Context,
) {
  try {
    if (!options.cookie)
      return '请提供cookie'

    const cookieRegex = /([^=;\s]+)=([^=;\s]*)/g

    if (!cookieRegex.test(session.content))
      return 'cookie 格式错误'

    const cookies = session.content.match(cookieRegex)

    const cookieJson = {
      ct0: '',
      auth_token: '',
    }

    const cookieStringObject = {}

    cookies.forEach((cookie) => {
      const [key, value] = cookie.split('=')
      if (['ct0', 'auth_token'].includes(key))
        cookieJson[key] = value

      cookieStringObject[key] = value
    })

    if (!cookieJson.auth_token || !cookieJson.ct0)
      return 'cookie 格式中缺少 auth_token 或 ct0'

    if (
      !(await fs.promises.stat(twitterDir)).isDirectory()
    )
      await fs.promises.mkdir(twitterDir, { recursive: true })
    await fs.promises.writeFile(
      twitterCookiePath,
      JSON.stringify({ cookieString: Object.entries(cookieStringObject).map(([key, value]) => `${key}=${value}`).join(';'), authCookie: { ...cookieJson } }),
    )

    ctx.http.config.headers['x-csrf-token'] = cookieJson.ct0
    ctx.http.config.headers.cookie = session.content

    return 'cookie 更新成功'
  }
  catch (err) {
    logger.error(`Failed to update cookie. ${err}`)
    return `cookie 更新失败: ${err}`
  }
}
