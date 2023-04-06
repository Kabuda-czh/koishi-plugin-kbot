/*
 * @Author: Kabuda-czh
 * @Date: 2023-04-06 11:03:23
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-04-06 11:11:41
 * @FilePath: \KBot-App\plugins\kbot\src\config\index.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { resolve } from 'node:path'

// public
export const publicDir = resolve(__dirname, '../../../../public')

// kbot
export const kbotDir = resolve(publicDir, 'kbot')

// bilibili
export const bilibiliDir = resolve(kbotDir, 'bilibili')
export const bilibiliCookiePath = resolve(bilibiliDir, 'cookie.json')
export const bilibiliVupPath = resolve(bilibiliDir, 'vup.json')

// twitter
export const twitterDir = resolve(kbotDir, 'twitter')
export const twitterCookiePath = resolve(twitterDir, 'cookie.json')
