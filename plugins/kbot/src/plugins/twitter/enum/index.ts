/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-17 14:45:05
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-06-26 11:19:40
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\twitter\enum\index.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
export enum TwitterDynamicType {
  // get user restId
  UserByScreenNameURL = 'https://twitter.com/i/api/graphql/qRednkZG-rn1P6b48NINmQ/UserByScreenName',
  // get user tweets
  UserTweetsURL = 'https://twitter.com/i/api/graphql/Uuw5X2n3tuGE_SatnXUqLA/UserTweets',
  // get user dynamic info
  UserStatusURL = 'https://twitter.com/%s/status/%s',
}
