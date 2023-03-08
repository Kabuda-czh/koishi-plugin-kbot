/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-03 16:34:11
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-03-03 10:16:00
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\bilibili\utils\biliRequest.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import * as fs from 'node:fs'
import { resolve } from 'node:path'
import type { Logger, Quester } from 'koishi'
import { BilibiliDynamicType } from '../enum'
import type { DanmukuData, MedalWall, MemberCard } from '../model'
import { StringFormat } from '../../utils'

export async function getDynamic(http: Quester, uid: string) {
  return await http.get(
    StringFormat(BilibiliDynamicType.DynamicDetailURL, uid),
    {
      headers: {
        Referer: `https://space.bilibili.com/${uid}/dynamic`,
      },
    },
  )
}

export async function searchUser(
  keyword: string,
  http: Quester,
  logger: Logger,
) {
  const data = { keyword, search_type: 'bili_user' }
  let cookie
  try {
    cookie = JSON.parse(
      fs.readFileSync(
        resolve(
          __dirname,
          '../../../../../../public/kbot/bilibili/cookie.json',
        ),
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
    const resp = await http
      .get(BilibiliDynamicType.SearchUserByApp, {
        params: data,
        headers: { cookie: cookieString, ...http.config.headers },
      })
      .then((resp) => {
        return resp
      })
      .catch((e) => {
        if (+e.response.status === 412) {
          return http
            .get(BilibiliDynamicType.SearchUserByPC, {
              params: data,
              headers: { cookie: cookieString, ...http.config.headers },
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
    const resp = await http.get<MedalWall>(
      StringFormat(BilibiliDynamicType.MedalWallURL, uid),
      {
        headers: {
          Referer: `https://space.bilibili.com/${uid}/medal`,
          cookie: cookieString,
        },
      },
    )

    if (resp.code === -101)
      throw new Error('cookie is invalid')

    return resp
  }
  catch (e) {
    throw new Error(`Failed to get medal wall [${e.message}]`)
  }
}

export async function getDanmukuData(http: Quester, uid: string) {
  try {
    const resp = await http.get<DanmukuData>(
      StringFormat(BilibiliDynamicType.DanmakuAPI, uid, 0),
    )
    return resp
  }
  catch (e) {
    throw new Error(`Failed to get danmuku data.${e}`)
  }
}
