/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-01 10:38:19
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-04-04 11:05:12
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

export interface Message {
  group: boolean
  group_id: number
  message_id: number
  real_id: number
  message_type: 'private' | 'group'
  sender: {
    user_id: number
    nickname: string
  }
  time: number
  message: string
  raw_message: string
}

export interface GroupInfo {
  group_id: number
  group_name: string
  max_member_count: number
  member_count: number
}

export interface GroupMemberInfo {
  group_id: number
  user_id: number
  nickname: string
  card: string
  sex: string
  age: string
  area: string
  join_time: number
  last_sent_time: number
  level: string
  role: 'owner' | 'admin' | 'member'
  unfriendly: boolean
  title: string
  title_expire_time: number
  card_changeable: boolean
  shut_up_timestamp: number
}

export interface IRouterStrategy {
  [key: string]: (context: Context) => (ctx: KoaContext) => Promise<void>
}
