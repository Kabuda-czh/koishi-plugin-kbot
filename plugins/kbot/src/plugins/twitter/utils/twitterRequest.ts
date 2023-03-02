/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-17 15:57:34
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-03-02 01:52:00
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\twitter\utils\twitterRequest.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { Context, Logger, Quester } from "koishi";
import { TwitterDynamicType } from "../enum";
import {
  Entry,
  UserByScreenNameParam,
  UserByScreenNameResponse,
  UserTweetsParam,
  UserTweetsResponse,
} from "../model";
import { getTwitterToken } from "./reGetToken";

export async function getTwitterRestId(
  twitterId: string,
  http: Quester,
  logger: Logger
): Promise<string[]> {
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

  // FIXME
  const data = await http
    .get<UserByScreenNameResponse>(
      `${TwitterDynamicType.UserByScreenNameURL}?variables=${encodeURIComponent(
        JSON.stringify(param.variables)
      )}&features=${encodeURIComponent(JSON.stringify(param.features))}`,
      {
        // params: {
        //   variables: encodeURIComponent(JSON.stringify(param.variables)),
        //   features: encodeURIComponent(JSON.stringify(param.features)),
        // },
      }
    )
    .then((res) => {
      return [res.data.user.result.rest_id, res.data.user.result.legacy.name];
    })
    .catch((err) => {
      logger.error(`error getTwitterRestId: ${err}`);
      return [];
    });

  return data;
}

export async function getTwitterTweets(
  restId: string,
  ctx: Context,
  logger: Logger,
  isPure: boolean = false
): Promise<Entry[]> {
  const param: UserTweetsParam = {
    variables: {
      userId: restId,
      count: 40,
      includePromotedContent: true,
      withQuickPromoteEligibilityTweetFields: true,
      withSuperFollowsUserFields: true,
      withDownvotePerspective: false,
      withReactionsMetadata: false,
      withReactionsPerspective: false,
      withSuperFollowsTweetFields: true,
      withVoice: true,
      withV2Timeline: true,
    },
    features: {
      responsive_web_twitter_blue_verified_badge_is_enabled: true,
      responsive_web_graphql_exclude_directive_enabled: false,
      verified_phone_label_enabled: false,
      responsive_web_graphql_timeline_navigation_enabled: true,
      responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
      tweetypie_unmention_optimization_enabled: true,
      vibe_api_enabled: true,
      responsive_web_edit_tweet_api_enabled: true,
      graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
      view_counts_everywhere_api_enabled: true,
      longform_notetweets_consumption_enabled: true,
      tweet_awards_web_tipping_enabled: false,
      freedom_of_speech_not_reach_fetch_enabled: false,
      standardized_nudges_misinfo: true,
      tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled:
        false,
      interactive_text_enabled: true,
      responsive_web_text_conversations_enabled: false,
      longform_notetweets_richtext_consumption_enabled: false,
      responsive_web_enhance_cards_enabled: false,
    },
  };

  let tokenError = false;

  const res: UserTweetsResponse = await ctx.http
    .get<UserTweetsResponse>(
      `${TwitterDynamicType.UserTweetsURL}?variables=${encodeURIComponent(
        JSON.stringify(param.variables)
      )}&features=${encodeURIComponent(JSON.stringify(param.features))}`
    )
    .then((res) => {
      return res;
    })
    .catch((err) => {
      tokenError = true;
      return err;
    });

  if (tokenError) {
    await getTwitterToken(ctx, logger);
    throw new Error(`${res}`);
  }

  if (!res) throw new Error(`Failed to get dynamics`);

  const instructions =
    res.data.user?.result?.timeline_v2.timeline.instructions || [];

  const entries = instructions.find(
    (entry) => entry.type === "TimelineAddEntries"
  )?.entries;

  if (isPure) {
    const pureEntries = entries.find(
      (entry) =>
        !entry.content.itemContent.tweet_results.result?.quoted_status_result
          ?.result &&
        !entry.content.itemContent.tweet_results.result.legacy
          ?.retweeted_status_result?.result
    );
    return [pureEntries];
  }

  return entries;
}
