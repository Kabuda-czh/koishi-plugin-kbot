import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import type { Context as KoaContext } from 'koa'
import type { IRouterStrategy } from '../typings'

import { kbotDir } from '../../../config'

function getImageInfo() {
  return async (ctx: KoaContext) => {
    const imageBase64 = ctx.request.body.image
    if (!imageBase64) {
      ctx.body = null
    }
    else {
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
  '/imageInfo': function () {
    return getImageInfo()
  },
}
