/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:44:19
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-03 14:40:52
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\bilibili\utils\toAvid.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import type { Dict } from 'koishi'

const table = 'fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF'
const tr = table
  .split('')
  .reduce((acc, x, i) => ({ ...acc, [x]: i }), {} as Dict<number>)
const s = [11, 10, 3, 8, 4, 6]

export function toAvid(bvid: string) {
  let r = 0
  for (let i = 0; i < 6; i++)
    r += tr[bvid[s[i]]] * 58 ** i

  return (r - 8728348608) ^ 177451812
}
