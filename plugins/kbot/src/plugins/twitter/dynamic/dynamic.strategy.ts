/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-03 13:57:11
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-06-26 11:30:05
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\twitter\dynamic\dynamic.strategy.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import * as fs from 'node:fs'
import { type Argv, type Channel, type Context, type Dict, sleep } from 'koishi'
import type { DynamicNotifiction } from '../model'
import { getTwitterRestId, getTwitterToken } from '../utils'
import { twitterCookiePath } from '../../../config'
import {
  twitterAdd,
  twitterBatch,
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
  let cookie
  try {
    cookie = JSON.parse(
      await fs.promises.readFile(
        twitterCookiePath,
        'utf-8',
      ),
    )
    ctx.http.config.headers['x-guest-token'] = cookie.cookies
  }
  catch (e) {
    await getTwitterToken(ctx, logger)
  }

  const strategyName = Object.keys(options).find(key => options[key])
  if (Object.keys(dynamicStrategies).includes(strategyName)) {
    let restId: string | string[], twitterName: string | string[], twitterId: string | string[]

    if (!['list', 'batch'].includes(strategyName)) {
      twitterId = options[strategyName] as string
      [restId as string, twitterName as string] = await getTwitterRestId(
        twitterId,
        ctx.http,
        logger,
      )

      if (!restId) {
        await getTwitterToken(ctx, logger)
        return '未获取到对应 twitter 博主 ID 信息, 重新获取 token, 请稍后重试'
      }
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

        await sleep(2000)
      }

      if (!restId.length) {
        await getTwitterToken(ctx, logger)
        return '未获取到对应 twitter 博主 ID 信息, 重新获取 token, 请稍后重试'
      }
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
