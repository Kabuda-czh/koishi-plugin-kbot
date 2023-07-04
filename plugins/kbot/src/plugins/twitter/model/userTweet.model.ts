/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-17 15:03:04
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-07-04 15:48:27
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\twitter\model\userTweet.model.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
export interface UserTweetsParam {
  variables: Variables
  features: Features
  fieldToggles: FieldToggles
}

interface Variables {
  userId: string
  count: number
  /*
   * true
   */
  includePromotedContent: boolean
  /*
   * true
   */
  withQuickPromoteEligibilityTweetFields: boolean
  /*
   * true
   */
  // withSuperFollowsUserFields: boolean
  /*
   * false
   */
  // withDownvotePerspective: boolean
  /*
   * false
   */
  // withReactionsMetadata: boolean
  /*
   * false
   */
  // withReactionsPerspective: boolean
  /*
   * true
   */
  // withSuperFollowsTweetFields: boolean
  /*
   * true
   */
  withVoice: boolean
  /*
   * true
   */
  withV2Timeline: boolean
}

interface Features {
  /*
   * true
   */
  // responsive_web_twitter_blue_verified_badge_is_enabled: boolean
  /*
   * true
   */
  responsive_web_graphql_exclude_directive_enabled: boolean
  /**
   * false
   */
  responsive_web_twitter_article_tweet_consumption_enabled: boolean
  /**
   * false
   */
  responsive_web_media_download_video_enabled: boolean
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
  // vibe_api_enabled: boolean
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
   * true
   */
  freedom_of_speech_not_reach_fetch_enabled: boolean
  /*
   * true
   */
  standardized_nudges_misinfo: boolean
  /*
   * true
   */
  tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: boolean
  /*
   * true
   */
  // interactive_text_enabled: boolean
  /*
   * false
   */
  // responsive_web_text_conversations_enabled: boolean
  /*
   * false
   */
  // longform_notetweets_richtext_consumption_enabled: boolean
  /*
   * false
   */
  responsive_web_enhance_cards_enabled: boolean
  /**
   * true
   */
  longform_notetweets_rich_text_read_enabled: boolean
  /**
   * true
   */
  longform_notetweets_inline_media_enabled: boolean
  /**
   * true
   */
  rweb_lists_timeline_redesign_enabled: boolean
  /**
   * true
   */
  creator_subscriptions_tweet_preview_api_enabled: boolean
}

interface FieldToggles {
  /**
   * false
   */
  withArticleRichContentState: boolean
}

// get -> data.user.result.timeline_v2.timeline.instructions[1] || instructions.fint(type === "TimelineAddEntries").entries[0].content.itemContent.tweet_results.result.rest_id && legacy.created_at
export interface UserTweetsResponse {
  data: Data
  error: any
}

interface Data {
  user: User
}

interface User {
  result: Result9
}

interface Result9 {
  __typename: string
  timeline_v2: Timelinev2
}

interface Timelinev2 {
  timeline: Timeline
}

interface Timeline {
  instructions: Instruction[]
  metadata: Metadata2
}

interface Metadata2 {
  scribeConfig: ScribeConfig
}

interface ScribeConfig {
  page: string
}

interface Instruction {
  type: string
  entries?: Entry[]
}

export interface Entry {
  entryId: string
  sortIndex: string
  content: Content
}

interface Content {
  entryType: string
  __typename: string
  items?: Item2[]
  metadata?: Metadata
  displayType?: string
  clientEventInfo?: ClientEventInfo2
  header?: Header
  footer?: Footer
  itemContent?: ItemContent2
  value?: string
  cursorType?: string
}

interface ItemContent2 {
  itemType: string
  __typename: string
  tweet_results: Tweetresults2
  tweetDisplayType: string
}

interface Tweetresults2 {
  result: Result8
}

interface Result8 {
  __typename: string
  rest_id: string
  core: Core2
  edit_control: Editcontrol
  edit_perspective: Editperspective
  is_translatable?: boolean
  views: Views2
  source: string
  legacy: Legacy7
  quick_promote_eligibility: Quickpromoteeligibility
  quoted_status_result?: Quotedstatusresult
  voiceInfo?: VoiceInfo
}

interface VoiceInfo {
  clipIndex: number
  numberOfClips: number
  totalDurationMillis: number
  audiowaveValues: number[]
}

interface Quotedstatusresult {
  result: Result7
}

interface Result7 {
  __typename: string
  rest_id: string
  core: Core
  edit_control: Editcontrol
  edit_perspective: Editperspective
  is_translatable: boolean
  views: Views
  source: string
  legacy: Legacy8
}

interface Legacy8 {
  bookmark_count: number
  bookmarked: boolean
  created_at: string
  conversation_id_str: string
  display_text_range: number[]
  entities: Entities7
  favorite_count: number
  favorited: boolean
  full_text: string
  is_quote_status: boolean
  lang: string
  quote_count: number
  reply_count: number
  retweet_count: number
  retweeted: boolean
  user_id_str: string
  id_str: string
  extended_entities?: Extendedentities4
  possibly_sensitive?: boolean
  possibly_sensitive_editable?: boolean
}

interface Extendedentities4 {
  media: Media7[]
}

interface Media7 {
  display_url: string
  expanded_url: string
  id_str: string
  indices: number[]
  media_key: string
  media_url_https: string
  type: string
  url: string
  ext_media_availability: Extmediaavailability
  features: Features2
  sizes: Sizes
  original_info: Originalinfo2
  additional_media_info?: Additionalmediainfo4
  mediaStats?: MediaStats
  video_info?: Videoinfo
  ext_alt_text?: string
}

interface Additionalmediainfo4 {
  title: string
  description: string
  embeddable: boolean
  monetizable: boolean
}

interface Entities7 {
  user_mentions: any[]
  urls: any[]
  hashtags: any[]
  symbols: any[]
  media?: Media3[]
}

interface Legacy7 {
  bookmark_count: number
  bookmarked: boolean
  created_at: string
  conversation_id_str: string
  display_text_range: number[]
  entities: Entities5
  extended_entities?: Extendedentities2
  favorite_count: number
  favorited: boolean
  full_text: string
  is_quote_status: boolean
  lang: string
  possibly_sensitive?: boolean
  possibly_sensitive_editable?: boolean
  quote_count: number
  reply_count: number
  retweet_count: number
  retweeted: boolean
  user_id_str: string
  id_str: string
  quoted_status_id_str?: string
  quoted_status_permalink?: Quotedstatuspermalink
  retweeted_status_result?: Retweetedstatusresult
}

interface Retweetedstatusresult {
  result: Result6
}

interface Result6 {
  __typename: string
  rest_id: string
  core: Core
  edit_control: Editcontrol
  edit_perspective: Editperspective
  is_translatable: boolean
  views: Views
  source: string
  legacy: Legacy6
}

interface Legacy6 {
  bookmark_count: number
  bookmarked: boolean
  created_at: string
  conversation_id_str: string
  display_text_range: number[]
  entities: Entities6
  extended_entities: Extendedentities3
  favorite_count: number
  favorited: boolean
  full_text: string
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

interface Extendedentities3 {
  media: Media6[]
}

interface Media6 {
  display_url: string
  expanded_url: string
  ext_alt_text?: string
  id_str: string
  indices: number[]
  media_key: string
  media_url_https: string
  type: string
  url: string
  ext_media_availability: Extmediaavailability
  features: Features3
  sizes: Sizes
  original_info: Originalinfo2
  additional_media_info?: Additionalmediainfo3
  mediaStats?: MediaStats
  video_info?: Videoinfo
}

interface Additionalmediainfo3 {
  title: string
  description: string
  monetizable: boolean
}

interface Entities6 {
  media: Media5[]
  user_mentions: any[]
  urls: Url2[]
  hashtags: any[]
  symbols: any[]
}

interface Media5 {
  display_url: string
  expanded_url: string
  id_str: string
  indices: number[]
  media_url_https: string
  type: string
  url: string
  features: Features3
  sizes: Sizes
  original_info: Originalinfo2
}

interface Features3 {
  large?: Large3
  medium?: Large3
  small?: Large3
  orig?: Large3
}

interface Large3 {
  faces: any[]
}

interface Quotedstatuspermalink {
  url: string
  expanded: string
  display: string
}

interface Extendedentities2 {
  media: Media4[]
}

interface Media4 {
  display_url: string
  expanded_url: string
  ext_alt_text?: string
  id_str: string
  indices: number[]
  media_key: string
  media_url_https: string
  type: string
  url: string
  ext_media_availability: Extmediaavailability
  features: Features2
  sizes: Sizes
  original_info: Originalinfo2
  additional_media_info?: Additionalmediainfo2
  mediaStats?: MediaStats
  video_info?: Videoinfo2
}

interface Videoinfo2 {
  aspect_ratio: number[]
  duration_millis?: number
  variants: Variant[]
}

interface Additionalmediainfo2 {
  title?: string
  description?: string
  embeddable?: boolean
  monetizable: boolean
  call_to_actions?: Calltoactions
}

interface Calltoactions {
  watch_now: Badge
}

interface Entities5 {
  media?: Media3[]
  user_mentions: Usermention[]
  urls: Url2[]
  hashtags: any[]
  symbols: any[]
}

interface Usermention {
  id_str: string
  name: string
  screen_name: string
  indices: number[]
}

interface Media3 {
  display_url: string
  expanded_url: string
  id_str: string
  indices: number[]
  media_url_https: string
  type: string
  url: string
  features: Features2
  sizes: Sizes
  original_info: Originalinfo2
}

interface Originalinfo2 {
  height: number
  width: number
  focus_rects?: Face[]
}

interface Features2 {
  large?: Large2
  medium?: Large2
  small?: Large2
  orig?: Large2
}

interface Large2 {
  faces: Face[]
}

interface Face {
  x: number
  y: number
  w: number
  h: number
}

interface Views2 {
  count?: string
  state: string
}

interface Core2 {
  user_results: Userresults3
}

interface Userresults3 {
  result: Result5
}

interface Result5 {
  __typename: string
  id: string
  rest_id: string
  affiliates_highlighted_label: Affiliateshighlightedlabel2
  has_graduated_access: boolean
  is_blue_verified: boolean
  profile_image_shape: string
  legacy: Legacy5
  professional?: Professional
}

interface Legacy5 {
  can_dm: boolean
  can_media_tag: boolean
  created_at: string
  default_profile: boolean
  default_profile_image: boolean
  description: string
  entities: Entities4
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
  profile_banner_url?: string
  profile_image_url_https: string
  profile_interstitial_type: string
  screen_name: string
  statuses_count: number
  translator_type: string
  url?: string
  verified: boolean
  verified_type?: string
  want_retweets: boolean
  withheld_in_countries: any[]
  protected?: boolean
  needs_phone_verification?: boolean
}

interface Entities4 {
  description: Description
  url?: Url3
}

interface Footer {
  displayType: string
  text: string
  landingUrl: Url
}

interface Header {
  displayType: string
  text: string
  sticky: boolean
}

interface ClientEventInfo2 {
  component: string
  details: Details
  element?: string
}

interface Metadata {
  conversationMetadata: ConversationMetadata
}

interface ConversationMetadata {
  allTweetIds: string[]
  enableDeduplication: boolean
}

interface Item2 {
  entryId: string
  item: Item
}

interface Item {
  itemContent: ItemContent
  clientEventInfo: ClientEventInfo
}

interface ClientEventInfo {
  component: string
  element: string
  details: Details
}

interface Details {
  timelinesDetails: TimelinesDetails
}

interface TimelinesDetails {
  injectionType: string
  controllerData?: string
  sourceData?: string
}

interface ItemContent {
  itemType: string
  __typename: string
  tweet_results?: Tweetresults
  tweetDisplayType?: string
  user_results?: Userresults2
  userDisplayType?: string
  promotedMetadata?: PromotedMetadata
}

interface PromotedMetadata {
  advertiser_results: Advertiserresults
  disclosureType: string
  experimentValues: ExperimentValue[]
  impressionId: string
  impressionString: string
  clickTrackingInfo: ClickTrackingInfo
}

interface ClickTrackingInfo {
  urlParams: ExperimentValue[]
}

interface ExperimentValue {
  key: string
  value: string
}

interface Advertiserresults {
  result: Result4
}

interface Result4 {
  __typename: string
  id: string
  rest_id: string
  affiliates_highlighted_label: Features
  has_graduated_access: boolean
  is_blue_verified: boolean
  profile_image_shape: string
  legacy: Legacy4
}

interface Legacy4 {
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
  pinned_tweet_ids_str: any[]
  possibly_sensitive: boolean
  profile_banner_url: string
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

interface Userresults2 {
  result: Result3
}

interface Result3 {
  __typename: string
  id: string
  rest_id: string
  affiliates_highlighted_label: Affiliateshighlightedlabel2
  has_graduated_access: boolean
  is_blue_verified: boolean
  profile_image_shape: string
  legacy: Legacy3
  professional?: Professional2
  super_follow_eligible?: boolean
}

interface Professional2 {
  rest_id: string
  professional_type: string
  category: Category[]
}

interface Legacy3 {
  can_dm: boolean
  can_media_tag: boolean
  created_at: string
  default_profile: boolean
  default_profile_image: boolean
  description: string
  entities: Entities3
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
  pinned_tweet_ids_str: (string | string)[]
  possibly_sensitive: boolean
  profile_banner_url: string
  profile_image_url_https: string
  profile_interstitial_type: string
  screen_name: string
  statuses_count: number
  translator_type: string
  url?: string
  verified: boolean
  verified_type?: string
  want_retweets: boolean
  withheld_in_countries: any[]
}

interface Entities3 {
  description: Description2
  url?: Url3
}

interface Description2 {
  urls: Url2[][]
}

interface Affiliateshighlightedlabel2 {
  label?: Label
}

interface Tweetresults {
  result: Result2
}

interface Result2 {
  __typename: string
  rest_id: string
  core: Core
  edit_control: Editcontrol
  edit_perspective: Editperspective
  is_translatable: boolean
  views: Views
  source: string
  legacy: Legacy2
  quick_promote_eligibility: Quickpromoteeligibility
}

interface Quickpromoteeligibility {
  eligibility: string
}

interface Legacy2 {
  bookmark_count: number
  bookmarked: boolean
  created_at: string
  conversation_id_str: string
  display_text_range: number[]
  entities: Entities2
  extended_entities: Extendedentities
  favorite_count: number
  favorited: boolean
  full_text: string
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
  in_reply_to_screen_name?: string
  in_reply_to_status_id_str?: string
  in_reply_to_user_id_str?: string
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
  additional_media_info: Additionalmediainfo
  mediaStats: MediaStats
  ext_media_availability: Extmediaavailability
  features: Features
  sizes: Sizes
  original_info: Originalinfo
  video_info: Videoinfo
}

interface Videoinfo {
  aspect_ratio: number[]
  duration_millis: number
  variants: Variant[]
}

interface Variant {
  bitrate?: number
  content_type: string
  url: string
}

interface Extmediaavailability {
  status: string
}

interface MediaStats {
  viewCount: number
}

interface Additionalmediainfo {
  monetizable: boolean
}

interface Entities2 {
  media: Media[]
  user_mentions: any[]
  urls: Url2[][]
  hashtags: any[]
  symbols: any[]
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
}

interface Sizes {
  large: Large
  medium: Large
  small: Large
  thumb: Large
}

interface Large {
  h: number
  w: number
  resize: string
}

interface Features {
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
  affiliates_highlighted_label: Affiliateshighlightedlabel
  has_graduated_access: boolean
  is_blue_verified: boolean
  profile_image_shape: string
  legacy: Legacy
  professional: Professional
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
  profile_banner_url: string
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

interface Entities {
  description: Description
  url: Url3
}

interface Url3 {
  urls: Url2[]
}

interface Url2 {
  display_url: string
  expanded_url: string
  url: string
  indices: number[]
}

interface Description {
  urls: any[]
}

interface Affiliateshighlightedlabel {
  label: Label
}

interface Label {
  url: Url
  badge: Badge
  description: string
  userLabelType: string
  userLabelDisplayType: string
}

interface Badge {
  url: string
}

interface Url {
  url: string
  urlType: string
}
