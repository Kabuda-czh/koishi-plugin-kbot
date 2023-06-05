/*
 * @Author: Kabuda-czh
 * @Date: 2023-04-06 11:03:23
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-06-02 11:37:54
 * @FilePath: \KBot-App\plugins\kbot\src\config\index.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { resolve } from 'node:path'

// assetsLocal
export const assetsLocalDir = resolve(__dirname, '../../../../data/assets')

// kbot
export const kbotDir = resolve(assetsLocalDir, 'kbot')

// bilibili
export const bilibiliDir = resolve(kbotDir, 'bilibili')
export const bilibiliCookiePath = resolve(bilibiliDir, 'cookie.json')
export const bilibiliVupPath = resolve(bilibiliDir, 'vup.json')

// twitter
export const twitterDir = resolve(kbotDir, 'twitter')
export const twitterCookiePath = resolve(twitterDir, 'cookie.json')
