/*
 * @Author: Kabuda-czh
 * @Date: 2023-06-28 17:34:17
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-07-24 12:02:32
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\guildManage\router\image.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import type { Context as KoaContext } from 'koa'
import type { Context } from 'koishi'
import type { IRouterStrategy } from '../typings'

import GeneratePath from '../../../config'

function getImageInfo(context: Context) {
  return async (ctx: KoaContext) => {
    const imageBase64 = ctx.request.body.image
    if (!imageBase64) {
      ctx.body = null
    }
    else {
      const { kbotDir } = GeneratePath.getInstance(context.baseDir).getGeneratePathData()
      // 将 base64 数据存入临时文件
      const tempPath = path.resolve(kbotDir, 'temp')
      if (!fs.existsSync(tempPath))
        await fs.promises.mkdir(tempPath)

      const tempFilePath = path.join(tempPath, `${Date.now()}.jpg`)
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
      // eslint-disable-next-line n/prefer-global/buffer
      const dataBuffer = Buffer.from(base64Data, 'base64')
      await fs.promises.writeFile(tempFilePath, dataBuffer)

      ctx.body = {
        code: 0,
        data: {
          path: pathToFileURL(tempFilePath),
        },
      }
    }
  }
}

export const imageRoutes: IRouterStrategy = {
  '/imageInfo': function (context: Context) {
    return getImageInfo(context)
  },
}
