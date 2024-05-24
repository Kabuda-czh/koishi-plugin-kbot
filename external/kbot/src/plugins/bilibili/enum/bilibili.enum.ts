/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-06 11:39:18
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-07-24 12:03:05
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\bilibili\enum\bilibili.enum.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
export enum BilibiliDynamicType {
  SearchUserByPC = 'https://api.bilibili.com/x/web-interface/wbi/search/all/v2',
  SearchUserByApp = 'https://api.bilibili.com/x/web-interface/search/type',
  UserInfo = 'https://api.bilibili.com/x/space/wbi/acc/info',
  UserNav = 'https://api.bilibili.com/x/web-interface/nav',
  DynamicDetailURL = 'https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?host_mid=%s',
  MemberCardURL = 'https://account.bilibili.com/api/member/getCardByMid?mid=%s',
  MedalWallURL = 'https://api.live.bilibili.com/xlive/web-ucenter/user/MedalWall?target_id=%s',
  DanmakuAPI = 'https://danmakus.com/api/search/user/detail?uid=%s&pagenum=%s&pagesize=5',
  DanmakuAPI2 = 'https://ukamnads.icu/api/search/user/detail?uid=%s&pagenum=%s&pagesize=5',
}

export enum BilibiliDynamicItemType {
  DYNAMIC_TYPE_AV = '发布了视频',
  DYNAMIC_TYPE_DRAW = '发布了动态',
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  DYNAMIC_TYPE_WORD = '发布了动态',
  DYNAMIC_TYPE_LIVE = '开始直播了',
}
