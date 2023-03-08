/*
 * @Author: Kabuda-czh
 * @Date: 2023-03-02 14:32:56
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-03-02 14:34:49
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\tarot\shuffle.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
export default function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
  return array
}
