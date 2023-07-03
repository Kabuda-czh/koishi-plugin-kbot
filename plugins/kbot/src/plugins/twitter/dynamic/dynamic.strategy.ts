/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-03 13:57:11
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-07-03 10:31:19
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\twitter\dynamic\dynamic.strategy.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { type Argv, type Channel, type Context, type Dict, sleep } from 'koishi'
import type { DynamicNotifiction } from '../model'
import { getTwitterRestId } from '../utils'
import {
  twitterAdd,
  twitterBatch,
  twitterCookie,
  twitterList,
  twitterRemove,
  twitterSearch,
} from './common'
import type { IConfig } from '.'
import { logger } from '.'

const dynamicStrategies = {
  add: twitterAdd,
  remove: twitterRemove,
  list: twitterList,
  search: twitterSearch,
  batch: twitterBatch,
  cookie: twitterCookie,
}

export async function dynamicStrategy(
  {
    session,
    options,
  }: Argv<never, 'id' | 'guildId' | 'platform' | 'twitter', any, any>,
  list: Dict<
    [
      Pick<Channel, 'id' | 'guildId' | 'platform' | 'twitter'>,
      DynamicNotifiction,
    ][]
  >,
  ctx: Context,
  config: IConfig,
) {
  const strategyName = Object.keys(options).find(key => options[key])
  if (Object.keys(dynamicStrategies).includes(strategyName)) {
    let restId: string | string[], twitterName: string | string[], twitterId: string | string[]

    if (!['list', 'batch', 'cookie'].includes(strategyName)) {
      twitterId = options[strategyName] as string
      [restId as string, twitterName as string] = await getTwitterRestId(
        twitterId,
        ctx.http,
        logger,
      )

      if (!restId)
        return '未获取到对应 twitter 博主 ID 信息, 请使用 twitter --ck <cookie> 设置 cookie'
    }
    else if (strategyName === 'batch') {
      await session.send('因 twitter 限制, 批量添加速度较慢, 每个用户添加间隔为 2s')
      restId = []
      twitterName = []
      twitterId = session.content
        .split(' ')
        .slice(2)
        .join(' ')
        .replace(/，/ig, ',')
        .split(',')
      for (const id of twitterId) {
        const [id_, name] = await getTwitterRestId(
          id.trim(),
          ctx.http,
          logger,
        )

        if (id_ && name) {
          restId.push(id_)
          twitterName.push(name)
        }

        await sleep(1000)
      }

      if (!restId.length)
        return '未获取到对应 twitter 博主 ID 信息, 请使用 twitter --ck <cookie> 设置 cookie'
    }

    return dynamicStrategies[strategyName]?.(
      { session, options },
      { twitterId, twitterName, twitterRestId: restId },
      list,
      ctx,
      config,
    )
  }
}
