/*
 * @Author: Kabuda-czh
 * @Date: 2023-07-04 11:34:44
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-07-04 13:04:43
 * @FilePath: \KBot-App\plugins\kbot\client\api\common.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { http } from '../utils'

export function fetchGetViolationList(guildId: string | number) {
  return http.request('get', '/getViolationList', { guildId })
}

export function fetchSetViolationList(guildId: string | number, violationCount: number, violationHandleWay: 'mute' | 'kick', violationList: string[]) {
  return http.request('post', '/setViolationList', { guildId, violationCount, violationHandleWay, violationList })
}

export function fetchGetAddValid(guildId: string | number) {
  return http.request('get', '/getValidList', { guildId })
}

export function fetchSetAddValid(guildId: string | number, timer: number, validObject: Record<string, string>) {
  return http.request('post', '/setValidList', { guildId, validTimer: timer, validObject })
}
