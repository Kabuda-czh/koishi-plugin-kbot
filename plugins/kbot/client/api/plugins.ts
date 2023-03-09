/*
 * @Author: Kabuda-czh
 * @Date: 2023-03-09 16:55:23
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-03-09 17:04:06
 * @FilePath: \KBot-App\plugins\kbot\client\api\plugins.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { http } from '../utils'

export function fetchCommands() {
  return http.request('get', '/commands')
}

export function fetchSwitchCommands(guildId: string | number, command: string) {
  return http.request('get', '/switchCommands', { guildId, command })
}
