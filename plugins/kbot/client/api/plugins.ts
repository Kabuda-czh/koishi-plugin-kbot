/*
 * @Author: Kabuda-czh
 * @Date: 2023-03-09 16:55:23
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-03-17 10:37:18
 * @FilePath: \KBot-App\plugins\kbot\client\api\plugins.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { http } from '../utils'

export function fetchCommands() {
  return http.request('get', '/commands')
}

export function fetchDisabledCommands(guildId: string | number) {
  return http.request('get', '/getDisabledCommands', { guildId })
}

export function fetchSwitchCommands(guildId: string | number, commands: string[]) {
  return http.request('get', '/switchCommands', { guildId, commands })
}
