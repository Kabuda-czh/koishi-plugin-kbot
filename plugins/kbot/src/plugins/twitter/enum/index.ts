/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-17 14:45:05
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-17 14:49:58
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\twitter\enum\index.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
export enum TwitterDynamicType {
  // get user restId
  UserByScreenNameURL = 'https://twitter.com/i/api/graphql/rePnxwe9LZ51nQ7Sn_xN_A/UserByScreenName',
  // get user tweets
  UserTweetsURL = 'https://twitter.com/i/api/graphql/OXXUyHfKYZ-xLx4NcL9-_Q/UserTweets',
  // get user dynamic info
  UserStatusURL = 'https://twitter.com/%s/status/%s',
}
