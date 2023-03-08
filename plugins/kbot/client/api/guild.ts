/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-02 11:22:41
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-02 11:30:37
 * @FilePath: \KBot-App\plugins\kbot\client\api\guild.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { http } from '../utils'

export function fetchGuildList() {
  return http.request('get', '/guildList')
}

export function fetchGuildMemberList(guildId: string | number) {
  return http.request('get', '/guildMemberList', { guildId })
}
