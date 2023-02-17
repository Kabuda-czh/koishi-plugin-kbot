/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-17 15:57:34
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-17 16:55:56
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\twitter\utils\twitterRequest.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { Quester } from "koishi";
import { TwitterDynamicType } from "../enum";
import { UserByScreenNameParam } from "../model";

export async function getTwitterRestId(
  twitterId: string,
  http: Quester
): Promise<string> {
  const param: UserByScreenNameParam = {
    variables: {
      screen_name: twitterId,
      withSafetyModeUserFields: true,
      withSuperFollowsUserFields: true,
    },
    features: {
      responsive_web_twitter_blue_verified_badge_is_enabled: true,
      responsive_web_graphql_exclude_directive_enabled: false,
      verified_phone_label_enabled: false,
      responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
      responsive_web_graphql_timeline_navigation_enabled: true,
    },
  };

  await http
    .get(TwitterDynamicType.UserByScreenNameURL, {
      params: {
        variables: encodeURIComponent(JSON.stringify(param.variables)),
        features: encodeURIComponent(JSON.stringify(param.features)),
      },
    })
    .then((res) => {
      console.log("res", res);
    })
    .catch((err) => {
      console.log("err", err);
    });

  return "";
}
