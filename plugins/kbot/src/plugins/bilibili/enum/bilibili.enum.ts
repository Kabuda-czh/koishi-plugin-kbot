/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-06 11:39:18
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-27 10:07:13
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\bilibili\enum\bilibili.enum.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
export enum BilibiliDynamicType {
  SearchUserByPC = 'https://api.bilibili.com/x/web-interface/wbi/search/all/v2',
  SearchUserByApp = 'https://api.bilibili.com/x/web-interface/search/type',
  UserInfo = 'https://api.bilibili.com/x/space/acc/info?mid=%s&gaia_source=m_station',
  DynamicDetailURL = 'https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?host_mid=%s',
  MemberCardURL = 'https://account.bilibili.com/api/member/getCardByMid?mid=%s',
  MedalWallURL = 'https://api.live.bilibili.com/xlive/web-ucenter/user/MedalWall?target_id=%s',
  DanmakuAPI = 'https://danmakus.com/api/search/user/detail?uid=%s&pagenum=%s&pagesize=5',
  DanmakuAPI2 = 'https://ukamnads.icu/api/search/user/detail?uid=%s&pagenum=%s&pagesize=5',
}
