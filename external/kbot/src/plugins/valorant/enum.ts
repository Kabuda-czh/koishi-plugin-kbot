/*
 * @Author: Kabuda-czh
 * @Date: 2023-04-19 14:30:26
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-04-25 11:45:28
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\valorant\enum.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
export enum ValorantApi {
  // authorization
  Authorization = 'https://auth.riotgames.com/api/v1/authorization',
  // entitlements
  Entitlements = 'https://entitlements.auth.riotgames.com/api/token/v1',
  // userinfo
  Userinfo = 'https://auth.riotgames.com/userinfo',
  // region
  Region = 'https://riot-geo.pas.si.riotgames.com/pas/v1/product/valorant',
  // authorize
  Authorize = 'https://auth.riotgames.com/authorize',
}
