/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-03 13:57:11
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-04-06 10:43:37
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\twitter\dynamic\dynamic.strategy.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import * as fs from 'node:fs'
import { resolve } from 'node:path'
import type { Argv, Channel, Context, Dict } from 'koishi'
import type { DynamicNotifiction } from '../model'
import { getTwitterRestId, getTwitterToken } from '../utils'
import {
  twitterAdd,
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
}

export const dynamicStrategy = async (
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
) => {
  let cookie
  try {
    cookie = JSON.parse(
      await fs.promises.readFile(
        resolve(__dirname, '../../../../../../public/kbot/twitter/cookie.json'),
        'utf-8',
      ),
    )
    ctx.http.config.headers['x-guest-token'] = cookie.cookies
  }
  catch (e) {
    cookie = await getTwitterToken(ctx, logger)
  }

  const strategyName = Object.keys(options).find(key => options[key])
  if (strategyName) {
    let restId, twitterName
    const twitterId = options[strategyName]
    if (!['list'].includes(strategyName)) {
      [restId, twitterName] = await getTwitterRestId(
        twitterId,
        ctx.http,
        logger,
      )
      if (!['list'].includes(strategyName) && !restId)
        return '未获取到对应 twitter 博主 ID 信息'
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
