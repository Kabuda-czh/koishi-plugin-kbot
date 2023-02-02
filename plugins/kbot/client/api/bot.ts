/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-02 11:22:34
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-02 13:35:59
 * @FilePath: \KBot-App\plugins\kbot\client\api\bot.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { http } from "../utils";

export function fetchSelf () {
  return http.request("get", "/self");
}

export function fetchSendMessage (guildId: string | number, message: string) {
  return http.request("get", "/sendMessage", { guildId, message });
}

export function fetchBroadcast (channels: (number | string)[], message: string, delay: number = 500) {
  return http.request("get", "/broadcast", { channels, message, delay });
}