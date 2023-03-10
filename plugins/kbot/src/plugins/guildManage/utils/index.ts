/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-01 10:36:24
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-03-09 15:24:21
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\guildManage\utils\index.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import type { Context } from 'koishi'
import type { Context as KoaContext } from 'koa'
import { logger } from '..'

export default function handleFunction<T = any>(
  context: Context,
  functionName: string,
  ...args: any[]
) {
  return async (ctx: KoaContext) => {
    await Promise.all(
      context.bots.flatMap(bot =>
        bot.platform === 'onebot'
          ? functionName.includes('internal.')
            ? bot.internal?.[functionName.slice(functionName.indexOf('.') + 1)](
              ...args.map(arg => (arg = ctx.query?.[arg] || '')),
            )
            : bot?.[functionName](
              ...args.map(arg => (arg = ctx.query?.[arg] || '')),
            )
          : [],
      ),
    )
      .then((res: T[]) => {
        ctx.body = res.flat()
      })
      .catch((err) => {
        logger.error(err)
        ctx.body = null
      })
  }
}
