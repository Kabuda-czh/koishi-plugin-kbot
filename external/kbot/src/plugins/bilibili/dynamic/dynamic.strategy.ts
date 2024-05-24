/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-03 13:57:11
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-06-26 10:41:11
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\bilibili\dynamic\dynamic.strategy.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import type { Argv, Channel, Context, Dict } from 'koishi'
import type { DynamicNotifiction } from '../model'
import { uidExtract } from '../utils'
import {
  bilibiliAdd,
  bilibiliBatch,
  bilibiliList,
  bilibiliRemove,
  bilibiliSearch,
} from './common'
import {
  bilibiliCookie,
  bilibiliDanmuCheck,
  bilibiliRefreshVup,
  bilibiliVupCheck,
} from './composition'
import { logger } from '.'
import type { IConfig } from '.'

const dynamicStrategies = {
  add: bilibiliAdd,
  remove: bilibiliRemove,
  list: bilibiliList,
  search: bilibiliSearch,
  vup: bilibiliVupCheck,
  danmu: bilibiliDanmuCheck,
  refresh: bilibiliRefreshVup,
  cookie: bilibiliCookie,
  batch: bilibiliBatch,
}

export async function dynamicStrategy(
  {
    session,
    options,
  }: Argv<never, 'id' | 'guildId' | 'platform' | 'bilibili', any, any>,
  list: Dict<
    [
      Pick<Channel, 'id' | 'guildId' | 'platform' | 'bilibili'>,
      DynamicNotifiction,
    ][]
  >,
  ctx: Context,
  config: IConfig,
) {
  const strategyName = Object.keys(options).find(key => options[key])
  if (Object.keys(dynamicStrategies).includes(strategyName)) {
    try {
      let value: string | string[]
      let uid: string | string[]
      if (!['list', 'cookie', 'refresh', 'batch'].includes(strategyName)) {
        value = options[strategyName] as string
        uid = await uidExtract(value, { session }, logger, ctx)
        if (!uid)
          return '未找到该 up, 请输入正确的 up 名 , up uid 或 up 首页链接'
      }
      else if (strategyName === 'batch') {
        value = session.content.split(' ').slice(2) as string[]
        uid = await Promise.all(value
          .join(' ')
          .replace(/，/ig, ',')
          .split(',')
          .map(
            async (v: string) => await uidExtract(v.trim(), { session }, logger, ctx),
          ),
        )
        uid = [...new Set(uid)]
      }

      return dynamicStrategies[strategyName]?.(
        { session, options },
        { uid, upName: value },
        list,
        ctx,
        config,
      )
    }
    catch (err) {
      return err.message
    }
  }
}
