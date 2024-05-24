/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-03 15:24:37
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2024-05-24 11:28:26
 * @FilePath: \kbot-app-new\external\kbot\src\plugins\bilibili\utils\b23Extract.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import type { Quester } from 'koishi'

export async function b23Extract(text: string, http: Quester) {
  const reg = /b23.(tv|wtf)[\\/]+(\w+)/
  const regValue = reg.exec(text)
  if (!regValue)
    return ''

  const URL = `https://b23.tv/${regValue[2]}`

  try {
    let b23URL = ''

    await http.get(URL, {
      //@ts-ignore
      // TODO: 需要修复
      beforeRedirect: (options) => {
        if (
          options.hostname === 'space.bilibili.com'
          || options.host === 'space.bilibili.com'
        )
          b23URL = options.href
      },
    })

    return b23URL
  }
  catch (e) {
    return ''
  }
}
