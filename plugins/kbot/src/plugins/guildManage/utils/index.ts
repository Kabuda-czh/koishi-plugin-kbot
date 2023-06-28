/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-01 10:36:24
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-06-28 17:22:38
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\guildManage\utils\index.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { Bot, Context } from 'koishi'
import type { Context as KoaContext } from 'koa'
import { logger } from '..'
import type { GroupMemberInfo } from '../typings'

export default function handleFunction<T = any>(
  context: Context,
  functionName: string,
  ...args: any[]
) {
  return async (ctx: KoaContext) => {
    await Promise.all(
      context.bots.flatMap(bot =>
        (bot.platform === 'onebot' && bot.selfId === (ctx.query[args[0]] || ctx.request.body[args[0]]) && bot.status === 'online')
          ? functionName.includes('internal.')
            ? bot.internal?.[functionName.slice(functionName.indexOf('.') + 1)](
              ...args.slice(1).map(arg => (arg = (ctx.query?.[arg] || ctx.request?.body?.[arg] || ''))),
            )
            : bot?.[functionName](
              ...args.slice(1).map(arg => (arg = (ctx.query?.[arg] || ctx.request?.body?.[arg] || ''))),
            )
          : [],
      ),
    )
      .then((res: T[]) => {
        if (['internal.sendGroupNotice', 'internal.setGroupPortrait'].includes(functionName)) {
          setTimeout(() => {
            deleteTempFile(ctx.query?.[args[args.length - 1]] as string || ctx.request.body?.[args[args.length - 1]])
          }, 60 * 1000)
        }

        ctx.body = res.flat()
      })
      .catch((err) => {
        logger.error(err)
        ctx.body = null
      })
  }
}

async function deleteTempFile(filePath: string) {
  if (!filePath)
    return

  try {
    await fs.promises.rm(fileURLToPath(filePath))
    logger.info(`已删除临时文件 ${filePath}`)
  }
  catch (err) {
    logger.error(`删除临时文件 ${filePath} 失败：${err}`)
  }
}

export async function getGroupMemberRole(bot: Bot, groupId: string | number, userId: string | number) {
  const res: GroupMemberInfo = await bot.internal.getGroupMemberInfo(groupId, userId)
  return res.role
}
