/*
 * @Author: Kabuda-czh
 * @Date: 2023-03-09 16:55:23
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-05-15 10:15:45
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
  return http.request('get', '/disabledCommands', { guildId })
}

export function fetchSwitchCommands(guildId: string | number, commands: string[]) {
  return http.request('get', '/switchCommands', { guildId, commands })
}
