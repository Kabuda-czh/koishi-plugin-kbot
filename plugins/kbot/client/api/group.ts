/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-02 11:22:38
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-03-17 10:29:13
 * @FilePath: \KBot-App\plugins\kbot\client\api\group.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { http } from '../utils'

export function fetchGroupList(botId: string | number) {
  return http.request('get', '/groupList', { botId })
}

export function fetchGroupMemberInfo(botId: string | number, groupId: string | number, userId: string | number, noCache: boolean) {
  return http.request('get', '/groupMemberInfo', { botId, groupId, userId, noCache })
}

export function fetchGroupMemberList(botId: string | number, groupId: string | number, noCache: boolean) {
  return http.request('get', '/groupMemberList', { botId, groupId, noCache })
}

export function fetchGroupLeave(botId: string | number, groupId: string | number, isDismiss: boolean) {
  return http.request('get', '/groupLeave', { botId, groupId, isDismiss })
}

export function fetchGroupKick(botId: string | number, groupId: string | number, userId: string | number, rejectAddRequest: boolean) {
  return http.request('get', '/groupKick', { botId, groupId, userId, rejectAddRequest })
}

export function fetchGroupAdmin(botId: string | number, groupId: string | number, userId: string | number, enable: boolean) {
  return http.request('get', '/groupAdmin', { botId, groupId, userId, enable })
}
