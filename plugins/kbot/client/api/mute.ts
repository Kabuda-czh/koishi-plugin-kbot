/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-02 11:22:45
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-02 11:24:35
 * @FilePath: \KBot-App\plugins\kbot\client\api\mute.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { http } from "../utils";

export function fetchMuteGuild (guildId: string | number, mute: number) {
  return http.request("get", "/muteGuild", { guildId, mute });
}

export function fetchMuteMember (guildId: string | number, userId: string | number, duration: number) {
  return http.request("get", "/muteMember", { guildId, userId, duration });
}