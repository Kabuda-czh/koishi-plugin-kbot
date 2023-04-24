/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-03 13:57:11
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-04-24 10:37:47
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
}

export const dynamicStrategy = async (
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
) => {
  const strategyName = Object.keys(options).find(key => options[key])
  // FIXME: 如果关闭 help 就会检测到 h 选项, 但是没有 h 选项的处理, twitter 同理
  if (strategyName) {
    const value = options[strategyName]
    try {
      let uid: string
      if (!['list', 'cookie', 'refresh'].includes(strategyName)) {
        uid = await uidExtract(value, { session }, logger, ctx)
        if (!uid)
          return '未找到该 up, 请输入正确的 up 名 , up uid 或 up 首页链接'
      }

      return dynamicStrategies[strategyName]?.(
        { session, options },
        uid,
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
