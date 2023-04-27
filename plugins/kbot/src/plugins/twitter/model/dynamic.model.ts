/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-17 15:25:48
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-27 13:39:36
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\twitter\model\dynamic.model.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
export interface DynamicNotifiction {
  botId: string
  twitterId: string
  twitterName: string
  twitterRestId: string
  lastUpdated?: number
}
