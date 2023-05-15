/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-02 11:22:34
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-05-15 10:15:19
 * @FilePath: \KBot-App\plugins\kbot\client\api\bot.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { http } from '../utils'

export function fetchGetBots() {
  return http.request('get', '/bots')
}

export function fetchSendMessage(botId: string | number, guildId: string | number, message: string) {
  return http.request('get', '/sendMessage', { botId, guildId, message })
}

export function fetchBroadcast(botId: string | number, channels: (number | string)[], message: string, delay = 500) {
  return http.request('get', '/broadcast', { botId, channels, message, delay })
}
