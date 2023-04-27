/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-06 14:17:09
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-06 14:25:34
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\bilibili\utils\functionHandle.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
export function intersection(
  array1: (string | number)[],
  array2: (string | number)[],
): (string | number)[] {
  const map1 = {}
  const map2 = {}
  let p1 = 0
  let p2 = 0
  const res = new Set<string>()
  while (p1 < array1.length || p2 < array2.length) {
    const n1 = array1[p1]
    const n2 = array2[p2]
    if (n1 !== undefined && map2[String(n1)])
      res.add(String(n1))
    map1[String(n1)] = true
    if (n2 !== undefined && map1[String(n2)])
      res.add(String(n2))
    map2[String(n2)] = true
    p1++
    p2++
  }

  return [...res]
}
