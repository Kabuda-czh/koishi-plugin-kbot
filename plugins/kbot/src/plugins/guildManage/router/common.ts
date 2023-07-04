/*
 * @Author: Kabuda-czh
 * @Date: 2023-03-16 16:24:21
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-07-04 13:07:03
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\guildManage\router\common.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import type { Context } from 'koishi'
import type { Context as KoaContext } from 'koa'
import type { IRouterStrategy } from '../typings'
import { logger } from '..'

function getViolationList(context: Context) {
  return async (ctx: KoaContext) => {
    const { guildId } = ctx.query
    const violationListRes = await context.database.get('guildmanage.violationList', { guildId })
    ctx.body = violationListRes[0] || []
  }
}

function setViolationList(context: Context) {
  return async (ctx: KoaContext) => {
    const { guildId, violationCount, violationHandleWay, violationList } = ctx.request.body
    try {
      const violationListRes = await context.database.get('guildmanage.violationList', { guildId })
      if (violationListRes.length)
        await context.database.upsert('guildmanage.violationList', [{ id: violationListRes[0].id, count: violationCount < 3 ? 3 : violationCount > 100 ? 100 : violationCount, handleWay: violationHandleWay, violations: violationList }])
      else
        await context.database.upsert('guildmanage.violationList', [{ guildId, count: 3, handleWay: 'mute', violations: violationList }])
      ctx.body = {
        code: 0,
        msg: '操作成功',
        data: null,
      }
    }
    catch (error) {
      logger.error(error)
      ctx.body = {
        code: -1,
        msg: `操作失败${error.message}`,
        data: null,
      }
    }
  }
}

function getValidList(context: Context) {
  return async (ctx: KoaContext) => {
    const { guildId } = ctx.query
    const validListRes = await context.database.get('guildmanage.addValid', { guildId })
    ctx.body = validListRes[0] || {}
  }
}

function setValidList(context: Context) {
  return async (ctx: KoaContext) => {
    const { guildId, validTimer, validObject } = ctx.request.body
    try {
      const validListRes = await context.database.get('guildmanage.addValid', { guildId })
      if (validListRes.length)
        await context.database.upsert('guildmanage.addValid', [{ id: validListRes[0].id, timer: validTimer < 60 ? 60 : validTimer > 600 ? 600 : validTimer, validObject }])
      else
        await context.database.upsert('guildmanage.addValid', [{ guildId, timer: 60, validObject }])
      ctx.body = {
        code: 0,
        msg: '操作成功',
        data: null,
      }
    }
    catch (error) {
      logger.error(error)
      ctx.body = {
        code: -1,
        msg: `操作失败${error.message}`,
        data: null,
      }
    }
  }
}

export const commonRoutes: IRouterStrategy = {
  '/getViolationList': function (context: Context) {
    return getViolationList(context)
  },
  '/setViolationList': function (context: Context) {
    return setViolationList(context)
  },
  '/getValidList': function (context: Context) {
    return getValidList(context)
  },
  '/setValidList': function (context: Context) {
    return setValidList(context)
  },
}
