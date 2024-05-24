/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-17 15:03:04
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-03-01 18:27:02
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\twitter\model\userMedia.model.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
export interface UserMediaParam {
  variables: Variables
  features: Features
}

interface Variables {
  userId: string
  count: number
  /**
   * false
   */
  includePromotedContent: boolean
  /**
   * true
   */
  withSuperFollowsUserFields: boolean
  /**
   * false
   */
  withDownvotePerspective: boolean
  /**
   * false
   */
  withReactionsMetadata: boolean
  /**
   * false
   */
  withReactionsPerspective: boolean
  /**
   * true
   */
  withSuperFollowsTweetFields: boolean
  /**
   * false
   */
  withClientEventToken: boolean
  /**
   * false
   */
  withBirdwatchNotes: boolean
  /**
   * true
   */
  withVoice: boolean
  /**
   * true
   */
  withV2Timeline: boolean
}

interface Features {
  /*
   * true
   */
  responsive_web_twitter_blue_verified_badge_is_enabled: boolean
  /*
   * false
   */
  responsive_web_graphql_exclude_directive_enabled: boolean
  /*
   * false
   */
  verified_phone_label_enabled: boolean
  /*
   * true
   */
  responsive_web_graphql_timeline_navigation_enabled: boolean
  /*
   * false
   */
  responsive_web_graphql_skip_user_profile_image_extensions_enabled: boolean
  /*
   * true
   */
  tweetypie_unmention_optimization_enabled: boolean
  /*
   * true
   */
  vibe_api_enabled: boolean
  /*
   * true
   */
  responsive_web_edit_tweet_api_enabled: boolean
  /*
   * true
   */
  graphql_is_translatable_rweb_tweet_is_translatable_enabled: boolean
  /*
   * true
   */
  view_counts_everywhere_api_enabled: boolean
  /*
   * true
   */
  longform_notetweets_consumption_enabled: boolean
  /*
   * false
   */
  tweet_awards_web_tipping_enabled: boolean
  /*
   * false
   */
  freedom_of_speech_not_reach_fetch_enabled: boolean
  /*
   * true
   */
  standardized_nudges_misinfo: boolean
  /*
   * false
   */
  tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: boolean
  /*
   * true
   */
  interactive_text_enabled: boolean
  /*
   * false
   */
  responsive_web_text_conversations_enabled: boolean
  /*
   * false
   */
  longform_notetweets_richtext_consumption_enabled: boolean
  /*
   * false
   */
  responsive_web_enhance_cards_enabled: boolean
}

export interface UserMediaResponse {
  data: Data
}

interface Data {
  user: User
}

interface User {
  result: Result3
}

interface Result3 {
  __typename: string
  timeline_v2: Timelinev2
}

interface Timelinev2 {
  timeline: Timeline
}

interface Timeline {
  instructions: Instruction[]
  metadata: Metadata
}

interface Metadata {
  scribeConfig: ScribeConfig
}

interface ScribeConfig {
  page: string
}

interface Instruction {
  type: string
  entries: Entry[]
}

interface Entry {
  entryId: string
  sortIndex: string
  content: Content
}

interface Content {
  entryType: string
  __typename: string
  itemContent?: ItemContent
  value?: string
  cursorType?: string
}

interface ItemContent {
  itemType: string
  __typename: string
  tweet_results: Tweetresults
  tweetDisplayType: string
}

interface Tweetresults {
  result: Result2
}

interface Result2 {
  __typename: string
  rest_id: string
  core: Core
  unmention_data: Unmentiondata
  edit_control: Editcontrol
  edit_perspective: Editperspective
  is_translatable: boolean
  views: Views
  source: string
  legacy: Legacy2
}

interface Legacy2 {
  created_at: string
  conversation_id_str: string
  display_text_range: number[]
  entities: Entities2
  extended_entities: Extendedentities
  favorite_count: number
  favorited: boolean
  full_text: string
  in_reply_to_screen_name?: string
  in_reply_to_status_id_str?: string
  in_reply_to_user_id_str?: string
  is_quote_status: boolean
  lang: string
  possibly_sensitive: boolean
  possibly_sensitive_editable: boolean
  quote_count: number
  reply_count: number
  retweet_count: number
  retweeted: boolean
  user_id_str: string
  id_str: string
}

interface Extendedentities {
  media: Media2[]
}

interface Media2 {
  display_url: string
  expanded_url: string
  id_str: string
  indices: number[]
  media_key: string
  media_url_https: string
  type: string
  url: string
  ext_media_color: Ok
  ext_media_availability: Extmediaavailability
  features: Features
  sizes: Sizes
  original_info: Originalinfo
  video_info?: Videoinfo
  additional_media_info?: Additionalmediainfo
  mediaStats?: MediaStats
  ext_alt_text?: string
}

interface MediaStats {
  viewCount: number
}

interface Additionalmediainfo {
  title: string
  description: string
  monetizable: boolean
}

interface Videoinfo {
  aspect_ratio: number[]
  variants: Variant[]
  duration_millis?: number
}

interface Variant {
  bitrate?: number
  content_type: string
  url: string
}

interface Extmediaavailability {
  status: string
}

interface Entities2 {
  media: Media[]
  user_mentions: Usermention[]
  urls: Url[]
  hashtags: any[]
  symbols: any[]
}

interface Usermention {
  id_str: string
  name: string
  screen_name: string
  indices: number[]
}

interface Media {
  display_url: string
  expanded_url: string
  id_str: string
  indices: number[]
  media_url_https: string
  type: string
  url: string
  features: Features
  sizes: Sizes
  original_info: Originalinfo
}

interface Originalinfo {
  height: number
  width: number
  focus_rects?: Face[]
}

interface Sizes {
  large: Large2
  medium: Large2
  small: Large2
  thumb: Large2
}

interface Large2 {
  h: number
  w: number
  resize: string
}

interface Features {
  large?: Large
  medium?: Large
  small?: Large
  orig?: Large
}

interface Large {
  faces: Face[]
}

interface Face {
  x: number
  y: number
  w: number
  h: number
}

interface Views {
  count: string
  state: string
}

interface Editperspective {
  favorited: boolean
  retweeted: boolean
}

interface Editcontrol {
  edit_tweet_ids: string[]
  editable_until_msecs: string
  is_edit_eligible: boolean
  edits_remaining: string
}

interface Unmentiondata {
  hydrate?: Hydrate
}

interface Hydrate {
  unmentioned_users_results: Unmentionedusersresult[]
}

interface Unmentionedusersresult {
  rest_id: string
}

interface Core {
  user_results: Userresults
}

interface Userresults {
  result: Result
}

interface Result {
  __typename: string
  id: string
  rest_id: string
  affiliates_highlighted_label: any
  has_graduated_access: boolean
  is_blue_verified: boolean
  legacy: Legacy
  professional: Professional
  has_nft_avatar: boolean
  super_follow_eligible: boolean
  super_followed_by: boolean
  super_following: boolean
  business_account: any
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
  blocked_by: boolean
  blocking: boolean
  follow_request_sent: boolean
  followed_by: boolean
  following: boolean
  muting: boolean
  notifications: boolean
  protected: boolean
  can_dm: boolean
  can_media_tag: boolean
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
  want_retweets: boolean
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
