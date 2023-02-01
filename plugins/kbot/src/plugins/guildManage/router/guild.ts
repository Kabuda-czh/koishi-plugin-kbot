/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-01 10:36:37
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-02 02:26:16
 * @FilePath: \koishi-plugin-kbot\plugins\kbot\src\plugins\guildManage\router\guild.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { Context, Universal } from "koishi"
import { GuildMemberInfo, IRouterStrategy } from "../typings"
import handleFunction from "../utils"

export const guildRoutes: IRouterStrategy = {
  "/guildList": function (context: Context) {
    return handleFunction<Universal.Guild>(context, "getGuildList")
  },
  "/guildMemberList": function (context: Context) {
    return handleFunction<GuildMemberInfo>(context, "getGuildMemberList", "guildId")
  },
  "/groupList": function (context: Context) {
    return handleFunction(context, "internal.getGroupList", "noCache")
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
  }
}