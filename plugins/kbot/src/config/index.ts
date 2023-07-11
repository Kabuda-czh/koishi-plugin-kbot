/*
 * @Author: Kabuda-czh
 * @Date: 2023-04-06 11:03:23
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-07-11 11:14:08
 * @FilePath: \KBot-App\plugins\kbot\src\config\index.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { resolve } from 'node:path'

export function generatePaths(path: string) {
  // baseDir
  const baseDir = resolve(__dirname, path)

  // kbot
  const kbotDir = resolve(baseDir, 'kbot-data')

  // bilibili
  const bilibiliDir = resolve(kbotDir, 'bilibili')
  const bilibiliCookiePath = resolve(bilibiliDir, 'cookie.json')
  const bilibiliVupPath = resolve(bilibiliDir, 'vup.json')

  // twitter
  const twitterDir = resolve(kbotDir, 'twitter')
  const twitterCookiePath = resolve(twitterDir, 'cookie.json')

  return {
    baseDir,
    kbotDir,
    bilibiliDir,
    bilibiliCookiePath,
    bilibiliVupPath,
    twitterDir,
    twitterCookiePath,
  }
}
