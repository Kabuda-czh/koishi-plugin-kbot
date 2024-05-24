/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-03 13:40:55
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-07-11 11:21:10
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\bilibili\dynamic\listen.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import type { Channel, Context, Dict } from 'koishi'
import type { BilibiliDynamicItem, DynamicNotifiction } from '../model'
import { renderFunction } from './render'
import { logger } from '.'
import type { IConfig } from '.'

export async function* listen(
  list: Dict<
    [
      Pick<Channel, 'id' | 'guildId' | 'platform' | 'bilibili'>,
      DynamicNotifiction,
    ][]
  >,
  request: (ctx: Context, uid: string) => Promise<BilibiliDynamicItem[]>,
  ctx: Context,
  config: IConfig,
) {
  while (true) {
    const entries = Object.entries(list)
    if (entries.length === 0) {
      yield
      continue
    }
    for (const [uid, notifications] of entries) {
      if (notifications.length === 0)
        continue
      const time = notifications[0][1].lastUpdated
      try {
        const items = await request(ctx, uid)
        // setup time on every start up
        if (!notifications[0]?.[1].lastUpdated) {
          notifications.forEach(
            ([, notification]) =>
              (notification.lastUpdated
                = items?.[0]?.modules?.module_author?.pub_ts
                || Math.ceil(+new Date() / 1000)),
          )
          continue
        }
        let neo = items?.filter(
          item => item.modules.module_author.pub_ts > time,
        ) || []
        if (!config.live)
          neo = neo.filter(item => item.type !== 'DYNAMIC_TYPE_LIVE_RCMD')
        if (neo.length !== 0) {
          const rendered = await Promise.all(
            neo.map(item => renderFunction(ctx, item, config)),
          )

          rendered.forEach((text, index) => {
            notifications.forEach(([channel, notification]) => {
              notification.lastUpdated
                = neo[index].modules.module_author.pub_ts
              ctx.bots[notification.botId]?.sendMessage(
                channel.id,
                text,
                channel.guildId,
              )
            })
          })
        }
      }
      catch (e) {
        logger.error(`轮询 Error: ${e}`)
      }
      yield
    }
  }
}
