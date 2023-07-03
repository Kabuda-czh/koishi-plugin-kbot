/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-17 14:45:05
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-07-03 09:46:55
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\twitter\enum\index.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
export enum TwitterDynamicType {
  // get user restId
  UserByScreenNameURL = 'https://twitter.com/i/api/graphql/oUZZZ8Oddwxs8Cd3iW3UEA/UserByScreenName',
  // get user tweets
  UserTweetsURL = 'https://twitter.com/i/api/graphql/QqZBEqganhHwmU9QscmIug/UserTweets',
  // get user dynamic info
  UserStatusURL = 'https://twitter.com/%s/status/%s',
  // get user media info
  UserMediaURL = 'https://twitter.com/i/api/graphql/Az0-KW6F-FyYTc2OJmvUhg/UserMedia',
}
