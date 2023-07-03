/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-17 15:57:34
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-07-03 10:59:40
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\twitter\utils\twitterRequest.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import type { Context, Logger, Quester } from 'koishi'
import { TwitterDynamicType } from '../enum'
import type {
  Entry,
  UserByScreenNameParam,
  UserByScreenNameResponse,
  UserTweetsParam,
  UserTweetsResponse,
} from '../model'

export async function getTwitterRestId(
  twitterId: string,
  http: Quester,
  logger: Logger,
): Promise<string[]> {
  const param: UserByScreenNameParam = {
    variables: {
      screen_name: twitterId,
      withSafetyModeUserFields: true,
      // withSuperFollowsUserFields: true,
    },
    features: {
      creator_subscriptions_tweet_preview_api_enabled: true,
      hidden_profile_likes_enabled: false,
      highlights_tweets_tab_ui_enabled: true,
      // responsive_web_twitter_blue_verified_badge_is_enabled: true,
      responsive_web_graphql_exclude_directive_enabled: true,
      responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
      responsive_web_graphql_timeline_navigation_enabled: true,
      subscriptions_verification_info_verified_since_enabled: true,
      verified_phone_label_enabled: false,
    },
  }

  // FIXME
  const data = await http
    .get<UserByScreenNameResponse>(
      `${TwitterDynamicType.UserByScreenNameURL}?variables=${encodeURIComponent(
        JSON.stringify(param.variables),
      )}&features=${encodeURIComponent(JSON.stringify(param.features))}`,
      {
        // params: {
        //   variables: encodeURIComponent(JSON.stringify(param.variables)),
        //   features: encodeURIComponent(JSON.stringify(param.features)),
        // },
      },
    )
    .then((res) => {
      return [res?.data?.user?.result?.rest_id, res?.data?.user?.result?.legacy?.name]
    })
    .catch((err) => {
      if (['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'ECONNABORTED'].includes(err.code))
        throw new Error('请求超时, 网络错误')

      logger.error(`error getTwitterRestId: ${err}`)
      return []
    })

  return data
}

export async function getTwitterTweets(
  restId: string,
  ctx: Context,
  logger: Logger,
  isPure = false,
  isListen = false,
): Promise<Entry[]> {
  const param: UserTweetsParam = {
    variables: {
      userId: restId,
      count: 20,
      includePromotedContent: true,
      withQuickPromoteEligibilityTweetFields: true,
      // withSuperFollowsUserFields: true,
      // withDownvotePerspective: false,
      // withReactionsMetadata: false,
      // withReactionsPerspective: false,
      // withSuperFollowsTweetFields: true,
      withVoice: true,
      withV2Timeline: true,
    },
    features: {
      creator_subscriptions_tweet_preview_api_enabled: true,
      freedom_of_speech_not_reach_fetch_enabled: true,
      graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
      // interactive_text_enabled: true,
      longform_notetweets_consumption_enabled: true,
      // longform_notetweets_richtext_consumption_enabled: false,
      longform_notetweets_rich_text_read_enabled: true,
      longform_notetweets_inline_media_enabled: true,
      responsive_web_edit_tweet_api_enabled: true,
      responsive_web_enhance_cards_enabled: false,
      responsive_web_graphql_exclude_directive_enabled: true,
      responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
      responsive_web_graphql_timeline_navigation_enabled: true,
      responsive_web_media_download_video_enabled: false,
      // responsive_web_text_conversations_enabled: false,
      responsive_web_twitter_article_tweet_consumption_enabled: false,
      // responsive_web_twitter_blue_verified_badge_is_enabled: true,
      rweb_lists_timeline_redesign_enabled: true,
      standardized_nudges_misinfo: true,
      tweet_awards_web_tipping_enabled: false,
      tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled:
        true,
      tweetypie_unmention_optimization_enabled: true,
      verified_phone_label_enabled: false,
      // vibe_api_enabled: true,
      view_counts_everywhere_api_enabled: true,
    },
    fieldToggles: {
      withArticleRichContentState: false,
    },
  }

  let tokenError = false

  const res: UserTweetsResponse = await ctx.http
    .get<UserTweetsResponse>(
      `${TwitterDynamicType.UserTweetsURL}?variables=${encodeURIComponent(
        JSON.stringify(param.variables),
      )}&features=${encodeURIComponent(JSON.stringify(param.features))}?fieldToggles=${encodeURIComponent(JSON.stringify(param.fieldToggles))}`,
    )
    .then((res) => {
      return res
    })
    .catch((err) => {
      if (err?.response?.status === 403) {
        tokenError = true
        return err
      }
      if (['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'ECONNABORTED'].includes(err.code)) {
        if (isListen)
          return 'continue'
        else throw new Error('请求超时, 网络错误')
      }
      throw new Error(`${err?.response?.data?.errors || 'cookie异常 请重新设置'}`)
    })

  if (tokenError)
    throw new Error('token 失效, 请使用 --ck 重新设置')

  if (res as unknown as string === 'continue')
    return []

  if (!res)
    throw new Error('动态获取失败，请稍后再试')

  const instructions
    = res?.data.user?.result?.timeline_v2?.timeline?.instructions || []

  const entries = instructions.find(
    entry => entry.type === 'TimelineAddEntries',
  )?.entries || []

  if (isPure) {
    const pureEntries = entries.find(
      entry =>
        !entry?.content?.itemContent?.tweet_results?.result?.quoted_status_result
          ?.result
        && !entry?.content?.itemContent?.tweet_results?.result?.legacy
          ?.retweeted_status_result?.result,
    )
    return [pureEntries]
  }

  return entries
}
