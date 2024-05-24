/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-17 14:55:46
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-07-03 10:02:02
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\twitter\model\userInfo.model.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
export interface UserByScreenNameParam {
  variables: Variables
  features: Features
}

interface Variables {
  screen_name: string
  /*
   * true
   */
  withSafetyModeUserFields: boolean
  /*
   * true
   */
  // withSuperFollowsUserFields: boolean
}

interface Features {
  /**
   * true
   */
  creator_subscriptions_tweet_preview_api_enabled: boolean
  /**
   * false
   */
  hidden_profile_likes_enabled: boolean
  /**
   * true
   */
  highlights_tweets_tab_ui_enabled: boolean
  /*
   * true
   */
  // responsive_web_twitter_blue_verified_badge_is_enabled: boolean
  /*
   * false
   */
  responsive_web_graphql_exclude_directive_enabled: boolean
  /*
   * false
   */
  verified_phone_label_enabled: boolean
  /*
   * false
   */
  responsive_web_graphql_skip_user_profile_image_extensions_enabled: boolean
  /*
   * true
   */
  responsive_web_graphql_timeline_navigation_enabled: boolean
  /**
   * true
   */
  subscriptions_verification_info_verified_since_enabled: boolean
}

// get -> data.user.result.rest_id
export interface UserByScreenNameResponse {
  errors: any
  data: Data
}

interface Data {
  user: User
}

interface User {
  result: Result
}

interface Result {
  __typename: string
  id: string
  rest_id: string
  affiliates_highlighted_label: any
  is_blue_verified: boolean
  legacy: Legacy
  professional: Professional
  has_nft_avatar: boolean
  super_follow_eligible: boolean
  super_followed_by: boolean
  super_following: boolean
  business_account: any
  legacy_extended_profile: any
  is_profile_translatable: boolean
  verification_info: Verificationinfo
}

interface Verificationinfo {
  reason: Reason
}

interface Reason {
  description: Description2
}

interface Description2 {
  text: string
  entities: Entity[]
}

interface Entity {
  from_index: number
  to_index: number
  ref: Ref
}

interface Ref {
  url: string
  url_type: string
}

interface Professional {
  rest_id: string
  professional_type: string
  category: Category[]
}

interface Category {
  id: number
  name: string
  icon_name: string
}

interface Legacy {
  protected: boolean
  created_at: string
  default_profile: boolean
  default_profile_image: boolean
  description: string
  entities: Entities
  fast_followers_count: number
  favourites_count: number
  followers_count: number
  friends_count: number
  has_custom_timelines: boolean
  is_translator: boolean
  listed_count: number
  location: string
  media_count: number
  name: string
  normal_followers_count: number
  pinned_tweet_ids_str: string[]
  possibly_sensitive: boolean
  profile_banner_extensions: Profilebannerextensions
  profile_banner_url: string
  profile_image_extensions: Profilebannerextensions
  profile_image_url_https: string
  profile_interstitial_type: string
  screen_name: string
  statuses_count: number
  translator_type: string
  url: string
  verified: boolean
  verified_type: string
  withheld_in_countries: any[]
}

interface Profilebannerextensions {
  mediaColor: MediaColor
}

interface MediaColor {
  r: R
}

interface R {
  ok: Ok
}

interface Ok {
  palette: Palette[]
}

interface Palette {
  percentage: number
  rgb: Rgb
}

interface Rgb {
  blue: number
  green: number
  red: number
}

interface Entities {
  description: Description
  url: Url2
}

interface Url2 {
  urls: Url[]
}

interface Url {
  display_url: string
  expanded_url: string
  url: string
  indices: number[]
}

interface Description {
  urls: any[]
}
