/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-02 11:22:41
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-05-15 11:22:28
 * @FilePath: \KBot-App\plugins\kbot\client\api\guild.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { http } from '../utils'

export function fetchGuildWatchList() {
  return http.request('get', '/guildWatchList')
}

export function fetchSetGuildWatch(guildId: string | number, isWatch: boolean) {
  return http.request('get', '/setGuildWatch', { guildId, isWatch: ~~isWatch })
}

export function fetchGuildList(botId: string | number) {
  return http.request('get', '/guildList', { botId })
}

export function fetchGuildMemberList(botId: string | number, guildId: string | number) {
  return http.request('get', '/guildMemberList', { botId, guildId })
}
