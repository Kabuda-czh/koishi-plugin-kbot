/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-03 16:34:11
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-07-11 11:25:50
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\bilibili\utils\biliRequest.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import * as fs from 'node:fs'
import type { Context, Logger, Quester } from 'koishi'
import { BilibiliDynamicType } from '../enum'
import type { DanmukuData, MedalWall, MemberCard } from '../model'
import { StringFormat } from '../../utils'
import GeneratePath from '../../../config'

export async function getDynamic(ctx: Context, uid: string, logger: Logger) {
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

  return ctx.http.get(
    StringFormat(BilibiliDynamicType.DynamicDetailURL, uid),
    {
      headers: {
        'Referer': `https://space.bilibili.com/${uid}/dynamic`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
        'cookie': `${cookieString}`,
      },
    },
  )
}

export async function searchUser(
  ctx: Context,
  keyword: string,
  logger: Logger,
) {
  const data = { keyword, search_type: 'bili_user' }
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

  try {
    const resp = await ctx.http
      .get(BilibiliDynamicType.SearchUserByApp, {
        params: data,
        headers: { cookie: cookieString, ...ctx.http.config.headers },
      })
      .then((resp) => {
        return resp
      })
      .catch((e) => {
        if (+e.response.status === 412) {
          return ctx.http
            .get(BilibiliDynamicType.SearchUserByPC, {
              params: data,
              headers: { cookie: cookieString, ...ctx.http.config.headers },
            })
            .then((resp) => {
              return resp
            })
        }
      })
    return resp.data
  }
  catch (e) {
    throw new Error(`Failed to search user.${e}`)
  }
}

export async function getMemberCard(http: Quester, uid: string) {
  try {
    const resp = await http.get<MemberCard>(
      StringFormat(BilibiliDynamicType.MemberCardURL, uid),
    )
    return resp
  }
  catch (e) {
    throw new Error(`Failed to get member card.${e}`)
  }
}

export async function getMedalWall(
  http: Quester,
  uid: string,
  cookieString: string,
) {
  try {
    const resp = await http.axios<MedalWall>({
      method: 'get',
      url: StringFormat(BilibiliDynamicType.MedalWallURL, uid),
      headers: {
        Cookie: cookieString,
        Referer: 'https://live.bilibili.com/',
      },
    })

    if (resp.data.code !== 0)
      throw new Error('cookie 信息已过期, 请使用 --ck 或 --cookie 更新cookie信息')

    return resp.data
  }
  catch (e) {
    throw new Error(e.message)
  }
}

export async function getDanmukuData(http: Quester, api: string, uid: string, pageNumber = 0) {
  try {
    const resp = await http.get<DanmukuData>(
      StringFormat(api, uid, pageNumber),
    )
    return resp
  }
  catch (e) {
    throw new Error(`Failed to get danmuku data.${e}`)
  }
}
