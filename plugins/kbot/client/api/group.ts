/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-02 11:22:38
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-02 13:31:32
 * @FilePath: \KBot-App\plugins\kbot\client\api\group.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { http } from "../utils";

export function fetchGroupList () {
  return http.request("get", "/groupList");
}

export function fetchGroupMemberInfo (groupId: string | number, userId: string | number, noCache: boolean) {
  return http.request("get", "/groupMemberInfo", { groupId, userId, noCache });
}

export function fetchGroupMemberList (groupId: string | number, noCache: boolean) {
  return http.request("get", "/groupMemberList", { groupId, noCache });
}

export function fetchGroupLeave (groupId: string | number, isDismiss: boolean) {
  return http.request("get", "/groupLeave", { groupId, isDismiss });
}

export function fetchGroupKick (groupId: string | number, userId: string | number, rejectAddRequest: boolean) {
  return http.request("get", "/groupKick", { groupId, userId, rejectAddRequest });
}

export function fetchGroupAdmin (groupId: string | number, userId: string | number, enable: boolean) {
  return http.request("get", "/groupAdmin", { groupId, userId, enable });
}