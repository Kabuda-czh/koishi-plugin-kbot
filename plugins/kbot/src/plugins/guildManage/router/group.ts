/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-01 10:36:37
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-02 11:58:11
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\guildManage\router\group.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { Context } from "koishi"
import { IRouterStrategy } from "../typings"
import handleFunction from "../utils"

export const groupRoutes: IRouterStrategy = {
  "/groupList": function (context: Context) {
    return handleFunction(context, "internal.getGroupList")
  },
  "/groupMemberInfo": function (context: Context) {
    return handleFunction(context, "internal.getGroupMemberInfo", "groupId", "userId", "noCache")
  },
  "/groupMemberList": function (context: Context) {
    return handleFunction(context, "internal.getGroupMemberList", "groupId", "noCache")
  },
  "/groupLeave": function (context: Context) {
    return handleFunction(context, "internal.setGroupLeave", "groupId", "isDismiss")
  },
  "/groupKick": function (context: Context) {
    return handleFunction(context, "internal.setGroupKick", "groupId", "userId", "rejectAddRequest")
  },
  "/groupAdmin": function (context: Context) {
    return handleFunction(context, "internal.setGroupAdmin", "groupId", "userId", "enable")
  }
}