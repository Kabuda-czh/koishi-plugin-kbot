/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-01 10:38:19
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-03-09 15:25:04
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\guildManage\typings\index.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import type { Context } from 'koishi'
import type { Context as KoaContext } from 'koa'

export interface UserInfo {
  userId: string
  username: string
  avatar?: string
}

export interface GuildMemberInfo extends UserInfo {
  nickname: string
}

export interface IRouterStrategy {
  [key: string]: (context: Context) => (ctx: KoaContext) => Promise<void>
}
