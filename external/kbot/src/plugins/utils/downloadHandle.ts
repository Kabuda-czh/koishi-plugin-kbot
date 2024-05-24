/*
 * @Author: Kabuda-czh
 * @Date: 2023-07-11 17:45:02
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-07-24 11:56:54
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\utils\downloadHandle.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import type { Context } from 'koishi'

export async function downloadAndMoveFiles(task: string, resource: string, urls: string[], ctx: Context) {
  const downloadPromise = ctx.downloads.nereid(task, urls, resource, {
    retry: 3,
  })

  return downloadPromise.promise
}
