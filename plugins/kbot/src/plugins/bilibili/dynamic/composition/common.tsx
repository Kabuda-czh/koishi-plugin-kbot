/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-06 17:22:33
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-07-24 13:19:56
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\bilibili\dynamic\composition\common.tsx
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import * as fs from 'node:fs'

import type { Argv, Channel, Context, Dict } from 'koishi'

import { logger } from '..'
import type { IConfig } from '..'

import type { DynamicNotifiction } from '../../model'
import { getDanmukuData, getMedalWall, getMemberCard } from '../../utils'

import { getFontsList } from '../../../utils'
import GeneratePath from '../../../../config'
import { BilibiliDynamicType } from '../../enum'
import { renderDanmu, renderVup } from './render'

export async function bilibiliVupCheck(
  { session }: Argv<never, 'id' | 'guildId' | 'platform' | 'bilibili', any>,
  up: {
    uid: string
    upName: string
  },
  _list: Dict<
    [
      Pick<Channel, 'id' | 'guildId' | 'platform' | 'bilibili'>,
      DynamicNotifiction,
    ][]
  >,
  ctx: Context,
  config: IConfig,
) {
  const { uid } = up
  try {
    const { bilibiliVupPath, bilibiliCookiePath, renderFontsDir } = GeneratePath.getInstance(ctx.baseDir).getGeneratePathData()

    if (ctx.puppeteer) {
      const searchUserCardInfo = await getMemberCard(ctx.http, uid)

      const needLoadFontList = await getFontsList(renderFontsDir, logger)

      let vdb, cookie

      try {
        vdb = JSON.parse(
          await fs.promises.readFile(
            bilibiliVupPath,
            'utf-8',
          ),
        )
      }
      catch (e) {
        logger.error(`Failed to get vup info. ${e}`)
        throw new Error('vtb信息未找到, 请使用 --re 或 --refresh 更新vup信息')
      }

      try {
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

      let vups: any[] = vdb.filter(vup => searchUserCardInfo.card.attentions.includes(vup.mid))

      const vupsLength = vups.length

      const cookieString = Object.entries(cookie)
        .map(([key, value]) => `${key}=${value}`)
        .join('; ')

      const medals = await getMedalWall(ctx.http, uid, cookieString)

      const medalArray = medals.data.list

      medalArray.sort((a, b) => b.medal_info.level - a.medal_info.level)

      const frontVups = []
      const medalMap = {}

      for (const medal of medalArray) {
        const up = {
          mid: medal.medal_info.target_id,
          uname: medal.target_name,
        }

        frontVups.push(up)
        medalMap[medal.medal_info.target_id] = medal
      }

      vups = frontVups.concat(vups)
      vups = frontVups.concat(vups.slice(frontVups.length))
      for (let i = frontVups.length; i < vups.length; i++) {
        if (medalMap[vups[i].mid]) {
          vups.splice(i, 1)
          i--
        }
      }

      if (vups.length > 50)
        await session.send('成分太多了, 只显示前50个')

      const image = await renderVup(searchUserCardInfo, vups, vupsLength, medalMap, needLoadFontList)

      await session.send(image)
    }
    else {
      return '未安装/启用puppeteer, 无法渲染成分信息!'
    }
  }
  catch (e) {
    if (['ECONNREFUSED', 'ECONNRESET'].includes(e.code))
      return '成分获取失败: 网络连接超时'

    logger.error(`Failed to get vup info. ${e}`)
    return `成分获取失败: ${e.message}`
  }
}

export async function bilibiliDanmuCheck(
  { session }: Argv<never, 'id' | 'guildId' | 'platform' | 'bilibili', any>,
  up: {
    uid: string
    upName: string
  },
  _list: Dict<
    [
      Pick<Channel, 'id' | 'guildId' | 'platform' | 'bilibili'>,
      DynamicNotifiction,
    ][]
  >,
  ctx: Context,
  _config: IConfig,
) {
  const { uid } = up
  try {
    if (ctx.puppeteer) {
      const { renderFontsDir } = GeneratePath.getInstance(ctx.baseDir).getGeneratePathData()

      const searchUserCardInfo = await getMemberCard(ctx.http, uid)

      const needLoadFontList = await getFontsList(renderFontsDir, logger)

      let danmuku = await getDanmukuData(ctx.http, BilibiliDynamicType.DanmakuAPI, uid)

      if (!(Object.prototype.toString.call(danmuku) === '[object object]'))
        danmuku = await getDanmukuData(ctx.http, BilibiliDynamicType.DanmakuAPI2, uid)

      const image = await renderDanmu(searchUserCardInfo, danmuku, needLoadFontList)

      await session.send(image)
    }
    else { return '未安装/启用puppeteer, 无法渲染弹幕信息!' }
  }
  catch (e) {
    if (['ECONNREFUSED', 'ECONNRESET'].includes(e.code))
      return '弹幕获取失败: 网络连接超时'
    logger.error(`Failed to get danmu info. ${e}`)
    return `弹幕获取失败: ${e.message}`
  }
}

export async function bilibiliRefreshVup(
  _: Argv<never, 'id' | 'guildId' | 'platform' | 'bilibili', any>,
  _up: {
    uid: string
    upName: string
  },
  _list: Dict<
    [
      Pick<Channel, 'id' | 'guildId' | 'platform' | 'bilibili'>,
      DynamicNotifiction,
    ][]
  >,
  ctx: Context,
  _config: IConfig,
) {
  const vtbURLs = [
    'https://api.vtbs.moe/v1/short',
    'https://api.tokyo.vtbs.moe/v1/short',
    'https://vtbs.musedash.moe/v1/short',
  ]

  try {
    const { bilibiliDir, bilibiliVupPath } = GeneratePath.getInstance(ctx.baseDir).getGeneratePathData()
    const vtbFetchs = await Promise.allSettled(
      vtbURLs.map(url =>
        ctx.http.axios(url)
          .then(res => res.data),
      ),
    )

    const vtbDatas = vtbFetchs.filter(res => res.status === 'fulfilled')

    if (vtbDatas.length === 0)
      return 'vup 获取失败'

    const vtbs = []

    vtbDatas.forEach((res: any) => {
      vtbs.push(...res.value)
    })

    if (
      !(await fs.promises.stat(bilibiliDir)).isDirectory()
    )
      await fs.promises.mkdir(bilibiliDir, { recursive: true })
    await fs.promises.writeFile(
      bilibiliVupPath,
      JSON.stringify(vtbs),
    )

    return 'vup 更新成功'
  }
  catch (err) {
    if (['ECONNREFUSED', 'ECONNRESET'].includes(err.code))
      return 'vup 更新失败: 网络连接超时'
    logger.error(`Failed to update vup. ${err}`)
    return `vup 更新失败: ${err.message}`
  }
}

export async function bilibiliCookie(
  {
    session,
    options,
  }: Argv<
  never,
  'id' | 'guildId' | 'platform' | 'bilibili',
  any,
  {
    cookie: string
  }
>,
  _up: {
    uid: string
    upName: string
  },
  _list: Dict<
    [
      Pick<Channel, 'id' | 'guildId' | 'platform' | 'bilibili'>,
      DynamicNotifiction,
    ][]
  >,
  ctx: Context,
) {
  try {
    const { bilibiliDir, bilibiliCookiePath } = GeneratePath.getInstance(ctx.baseDir).getGeneratePathData()
    if (!options.cookie)
      return '请提供cookie'

    const cookieRegex = /([^=;\s]+)=([^=;\s]*)/g

    if (!cookieRegex.test(session.content))
      return 'cookie 格式错误'

    const cookies = session.content.match(cookieRegex)

    const cookieJson = {}

    cookies.forEach((cookie) => {
      const [key, value] = cookie.split('=')
      cookieJson[key] = value
    })

    if (
      !(await fs.promises.stat(bilibiliDir)).isDirectory()
    )
      await fs.promises.mkdir(bilibiliDir, { recursive: true })
    await fs.promises.writeFile(
      bilibiliCookiePath,
      JSON.stringify(cookieJson),
    )

    return 'cookie 更新成功'
  }
  catch (err) {
    logger.error(`Failed to update cookie. ${err}`)
    return `cookie 更新失败: ${err}`
  }
}
