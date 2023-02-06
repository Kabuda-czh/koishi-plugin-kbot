/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-06 11:39:18
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-06 12:54:35
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\bilibili\enum\bilibili.enum.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
export enum BilibiliDynamicType {
  UserInfo = "https://api.bilibili.com/x/space/acc/info?mid=%s&gaia_source=m_station",
  DynamicDetailURL = "https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?host_mid=%s",
  MemberCardURL = "https://account.bilibili.com/api/member/getCardByMid?mid=%s",
  MedalWallURL = "https://api.live.bilibili.com/xlive/web-ucenter/user/MedalWall?target_id=%s",
  DanmakuAPI = "https://danmakus.com/api/search/user/detail?uid=%s&pagenum=%s&pagesize=5"
}
