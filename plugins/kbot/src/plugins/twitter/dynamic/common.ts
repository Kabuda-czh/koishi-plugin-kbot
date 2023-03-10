/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-03 12:57:50
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-03-08 11:13:29
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\twitter\dynamic\common.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import type { Argv, Channel, Context, Dict } from 'koishi'
import type { DynamicNotifiction } from '../model'
import { getTwitterTweets } from '../utils'
import { renderFunction } from './render'
import { logger } from '.'
import type { IConfig } from '.'

export async function twitterAdd(
  { session }: Argv<never, 'id' | 'guildId' | 'platform' | 'twitter', any>,
  twitter: { twitterId: string; twitterName: string; twitterRestId: string },
  list: Dict<
    [
      Pick<Channel, 'id' | 'guildId' | 'platform' | 'twitter'>,
      DynamicNotifiction,
    ][]
  >,
  ctx: Context,
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
    logger.error(`Failed to add user ${twitterId}. ${e}`)
    return `请求失败，请检查 id 是否正确或重试${e}`
  }
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
        `- @${notification.twitterId} ${notification.twitterName}`,
    )
    .join('\n')
}

export async function twitterSearch(
  { session }: Argv<never, 'id' | 'guildId' | 'platform' | 'twitter', any>,
  twitter: { twitterId: string; twitterName: string; twitterRestId: string },
  list: Dict<
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
    logger.error(`Failed to get user dynamics. ${e}`)
    return `动态获取失败${e}`
  }
}
