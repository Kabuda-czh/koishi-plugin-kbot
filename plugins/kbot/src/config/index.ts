/*
 * @Author: Kabuda-czh
 * @Date: 2023-04-06 11:03:23
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-07-11 17:27:59
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

  // fonts
  const fontsDir = resolve(kbotDir, 'fonts')
  const renderFontsDir = resolve(fontsDir, 'render')
  const statusFontsDir = resolve(fontsDir, 'status')

  // images
  const imagesDir = resolve(kbotDir, 'images')
  const statusImagesDir = resolve(imagesDir, 'status')
  const tarotImagesDir = resolve(imagesDir, 'tarot')

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
    fontsDir,
    renderFontsDir,
    statusFontsDir,
    imagesDir,
    statusImagesDir,
    tarotImagesDir,
    bilibiliDir,
    bilibiliCookiePath,
    bilibiliVupPath,
    twitterDir,
    twitterCookiePath,
  }
}
