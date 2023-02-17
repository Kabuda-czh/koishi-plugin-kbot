/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-17 15:03:04
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-17 15:24:18
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\twitter\model\userTweet.model.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
export interface UserTweetsParam {
  variables: Variables;
  features: Features;
}

interface Variables {
  userId: string;
  count: number;
  /*
   * true
   */
  includePromotedContent: boolean;
  /*
   * true
   */
  withQuickPromoteEligibilityTweetFields: boolean;
  /*
   * true
   */
  withSuperFollowsUserFields: boolean;
  /*
   * false
   */
  withDownvotePerspective: boolean;
  /*
   * false
   */
  withReactionsMetadata: boolean;
  /*
   * false
   */
  withReactionsPerspective: boolean;
  /*
   * true
   */
  withSuperFollowsTweetFields: boolean;
  /*
   * true
   */
  withVoice: boolean;
  /*
   * true
   */
  withV2Timeline: boolean;
}

interface Features {
  /*
   * true
   */
  responsive_web_twitter_blue_verified_badge_is_enabled: boolean;
  /*
   * false
   */
  responsive_web_graphql_exclude_directive_enabled: boolean;
  /*
   * false
   */
  verified_phone_label_enabled: boolean;
  /*
   * true
   */
  responsive_web_graphql_timeline_navigation_enabled: boolean;
  /*
   * false
   */
  responsive_web_graphql_skip_user_profile_image_extensions_enabled: boolean;
  /*
   * true
   */
  tweetypie_unmention_optimization_enabled: boolean;
  /*
   * true
   */
  vibe_api_enabled: boolean;
  /*
   * true
   */
  responsive_web_edit_tweet_api_enabled: boolean;
  /*
   * true
   */
  graphql_is_translatable_rweb_tweet_is_translatable_enabled: boolean;
  /*
   * true
   */
  view_counts_everywhere_api_enabled: boolean;
  /*
   * true
   */
  longform_notetweets_consumption_enabled: boolean;
  /*
   * false
   */
  tweet_awards_web_tipping_enabled: boolean;
  /*
   * false
   */
  freedom_of_speech_not_reach_fetch_enabled: boolean;
  /*
   * true
   */
  standardized_nudges_misinfo: boolean;
  /*
   * false
   */
  tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: boolean;
  /*
   * true
   */
  interactive_text_enabled: boolean;
  /*
   * false
   */
  responsive_web_text_conversations_enabled: boolean;
  /*
   * false
   */
  responsive_web_enhance_cards_enabled: boolean;
}

// get -> data.user.result.timeline_v2.timeline.instructions[1] || instructions.fint(type === "TimelineAddEntries").entries[0].content.itemContent.tweet_results.result.rest_id && legacy.created_at
export interface UserTweetsResponse {
  data: Data;
  error: any;
}

interface Data {
  user: User;
}

interface User {
  result: Result13;
}

interface Result13 {
  __typename: string;
  timeline_v2: Timelinev2;
}

interface Timelinev2 {
  timeline: Timeline;
}

interface Timeline {
  instructions: Instruction[];
}

interface Instruction {
  type: string;
  entries?: Entry[];
  entry?: Entry2;
}

interface Entry2 {
  entryId: string;
  sortIndex: string;
  content: Content2;
}

interface Content2 {
  entryType: string;
  __typename: string;
  itemContent: ItemContent2;
  clientEventInfo: ClientEventInfo;
}

interface ClientEventInfo {
  component: string;
  details: Details;
}

interface Details {
  timelinesDetails: TimelinesDetails;
}

interface TimelinesDetails {
  injectionType: string;
}

interface ItemContent2 {
  itemType: string;
  __typename: string;
  tweet_results: Tweetresults2;
  tweetDisplayType: string;
  ruxContext: string;
  socialContext: SocialContext;
}

interface SocialContext {
  type: string;
  contextType: string;
  text: string;
}

interface Tweetresults2 {
  result: Result12;
}

interface Result12 {
  __typename: string;
  rest_id: string;
  core: Core;
  unmention_data: any;
  edit_control: Editcontrol;
  views: Views2;
  source: string;
  legacy: Legacy14;
  quick_promote_eligibility: Quickpromoteeligibility;
}

interface Legacy14 {
  created_at: string;
  conversation_id_str: string;
  display_text_range: number[];
  entities: Entities9;
  extended_entities: Extendedentities5;
  favorite_count: number;
  favorited: boolean;
  full_text: string;
  is_quote_status: boolean;
  lang: string;
  possibly_sensitive: boolean;
  possibly_sensitive_editable: boolean;
  quote_count: number;
  reply_count: number;
  retweet_count: number;
  retweeted: boolean;
  user_id_str: string;
  id_str: string;
}

interface Extendedentities5 {
  media: Media9[];
}

interface Media9 {
  display_url: string;
  expanded_url: string;
  ext_alt_text: string;
  id_str: string;
  indices: number[];
  media_key: string;
  media_url_https: string;
  type: string;
  url: string;
  ext_media_color: Ok;
  ext_media_availability: Extmediaavailability;
  features: Features4;
  sizes: Sizes;
  original_info: Originalinfo2;
}

interface Entities9 {
  media: Media7[];
  user_mentions: any[];
  urls: any[];
  hashtags: Hashtag[];
  symbols: any[];
}

interface Entry {
  entryId: string;
  sortIndex: string;
  content: Content;
}

interface Content {
  entryType: string;
  __typename: string;
  itemContent?: ItemContent;
  reactiveTriggers?: ReactiveTriggers;
  value?: string;
  cursorType?: string;
  stopOnEmptyResponse?: boolean;
}

interface ReactiveTriggers {
  onLinger: OnLinger;
}

interface OnLinger {
  execution: Execution;
  maxExecutionCount: number;
}

interface Execution {
  type: string;
  key: string;
}

interface ItemContent {
  itemType: string;
  __typename: string;
  tweet_results: Tweetresults;
  tweetDisplayType: string;
  ruxContext: string;
}

interface Tweetresults {
  result: Result11;
}

interface Result11 {
  __typename: string;
  rest_id: string;
  core: Core;
  unmention_data: any;
  edit_control: Editcontrol;
  views: Views;
  source: string;
  legacy: Legacy8;
  quick_promote_eligibility: Quickpromoteeligibility;
  card?: Card2;
  unified_card?: Unifiedcard;
  quoted_status_result?: Quotedstatusresult2;
}

interface Quotedstatusresult2 {
  result: Result10;
}

interface Result10 {
  __typename: string;
  rest_id: string;
  core: Core4;
  unmention_data: any;
  edit_control: Editcontrol;
  views: Views2;
  source: string;
  legacy: Legacy13;
}

interface Legacy13 {
  created_at: string;
  conversation_id_str: string;
  display_text_range: number[];
  entities: Entities8;
  extended_entities?: Extendedentities4;
  favorite_count: number;
  favorited: boolean;
  full_text: string;
  is_quote_status: boolean;
  lang: string;
  possibly_sensitive?: boolean;
  possibly_sensitive_editable?: boolean;
  quote_count: number;
  reply_count: number;
  retweet_count: number;
  retweeted: boolean;
  user_id_str: string;
  id_str: string;
}

interface Extendedentities4 {
  media: Media8[];
}

interface Media8 {
  display_url: string;
  expanded_url: string;
  id_str: string;
  indices: number[];
  media_key: string;
  media_url_https: string;
  type: string;
  url: string;
  ext_media_color: Ok;
  ext_media_availability: Extmediaavailability;
  features: Features4;
  sizes: Sizes;
  original_info: Originalinfo2;
}

interface Entities8 {
  media?: Media7[];
  user_mentions: any[];
  urls: Url[];
  hashtags: any[];
  symbols: any[];
}

interface Media7 {
  display_url: string;
  expanded_url: string;
  id_str: string;
  indices: number[];
  media_url_https: string;
  type: string;
  url: string;
  features: Features4;
  sizes: Sizes;
  original_info: Originalinfo2;
}

interface Features4 {
  large: Large5;
  medium: Large5;
  small: Large5;
  orig: Large5;
}

interface Large5 {
  faces: any[];
}

interface Core4 {
  user_results: Userresults5;
}

interface Userresults5 {
  result: Result9;
}

interface Result9 {
  __typename: string;
  id: string;
  rest_id: string;
  affiliates_highlighted_label: any;
  is_blue_verified: boolean;
  legacy: Legacy12;
  has_nft_avatar: boolean;
  super_follow_eligible: boolean;
  super_followed_by: boolean;
  super_following: boolean;
  business_account: any;
  professional?: Professional;
}

interface Legacy12 {
  protected: boolean;
  created_at: string;
  default_profile: boolean;
  default_profile_image: boolean;
  description: string;
  entities: Entities7;
  fast_followers_count: number;
  favourites_count: number;
  followers_count: number;
  friends_count: number;
  has_custom_timelines: boolean;
  is_translator: boolean;
  listed_count: number;
  location: string;
  media_count: number;
  name: string;
  normal_followers_count: number;
  pinned_tweet_ids_str: string[];
  possibly_sensitive: boolean;
  profile_banner_extensions: Profilebannerextensions;
  profile_banner_url: string;
  profile_image_extensions: Profilebannerextensions;
  profile_image_url_https: string;
  profile_interstitial_type: string;
  screen_name: string;
  statuses_count: number;
  translator_type: string;
  url: string;
  verified: boolean;
  withheld_in_countries: any[];
  verified_type?: string;
}

interface Entities7 {
  description: Description2;
  url: Url2;
}

interface Card2 {
  rest_id: string;
  legacy: Legacy11;
}

interface Legacy11 {
  binding_values: Bindingvalue2[];
  card_platform: Cardplatform;
  name: string;
  url: string;
  user_refs_results: (Userrefsresult | Userrefsresults2 | Userresults)[];
}

interface Userrefsresults2 {
  result: Result8;
}

interface Result8 {
  __typename: string;
  id: string;
  rest_id: string;
  affiliates_highlighted_label: any;
  is_blue_verified: boolean;
  legacy: Legacy10;
  professional: Professional;
  has_nft_avatar: boolean;
  super_follow_eligible: boolean;
  super_followed_by: boolean;
  super_following: boolean;
  business_account: any;
}

interface Legacy10 {
  protected: boolean;
  created_at: string;
  default_profile: boolean;
  default_profile_image: boolean;
  description: string;
  entities: Entities6;
  fast_followers_count: number;
  favourites_count: number;
  followers_count: number;
  friends_count: number;
  has_custom_timelines: boolean;
  is_translator: boolean;
  listed_count: number;
  location: string;
  media_count: number;
  name: string;
  normal_followers_count: number;
  pinned_tweet_ids_str: any[];
  possibly_sensitive: boolean;
  profile_banner_extensions: Profilebannerextensions;
  profile_banner_url: string;
  profile_image_extensions: Profilebannerextensions;
  profile_image_url_https: string;
  profile_interstitial_type: string;
  screen_name: string;
  statuses_count: number;
  translator_type: string;
  url: string;
  verified: boolean;
  verified_type: string;
  withheld_in_countries: any[];
}

interface Entities6 {
  description: Url2;
  url: Url2;
}

interface Userrefsresult {
  result: Result7;
}

interface Result7 {
  __typename: string;
  id: string;
  rest_id: string;
  affiliates_highlighted_label: any;
  is_blue_verified: boolean;
  legacy: Legacy9;
  has_nft_avatar: boolean;
  super_follow_eligible: boolean;
  super_followed_by: boolean;
  super_following: boolean;
  business_account: any;
}

interface Legacy9 {
  protected: boolean;
  created_at: string;
  default_profile: boolean;
  default_profile_image: boolean;
  description: string;
  entities: Entities;
  fast_followers_count: number;
  favourites_count: number;
  followers_count: number;
  friends_count: number;
  has_custom_timelines: boolean;
  is_translator: boolean;
  listed_count: number;
  location: string;
  media_count: number;
  name: string;
  normal_followers_count: number;
  pinned_tweet_ids_str: any[];
  possibly_sensitive: boolean;
  profile_banner_extensions: Profilebannerextensions;
  profile_banner_url: string;
  profile_image_extensions: Profilebannerextensions;
  profile_image_url_https: string;
  profile_interstitial_type: string;
  screen_name: string;
  statuses_count: number;
  translator_type: string;
  url: string;
  verified: boolean;
  verified_type: string;
  withheld_in_countries: any[];
}

interface Bindingvalue2 {
  key: string;
  value: Value2;
}

interface Value2 {
  string_value?: string;
  type: string;
  scribe_key?: string;
  image_value?: Imagevalue;
  user_value?: Uservalue;
  image_color_value?: Ok;
}

interface Uservalue {
  id_str: string;
  path: any[];
}

interface Imagevalue {
  alt?: string;
  height: number;
  width: number;
  url: string;
}

interface Quickpromoteeligibility {
  eligibility: string;
}

interface Legacy8 {
  created_at: string;
  conversation_id_str: string;
  display_text_range: number[];
  entities: Entities2;
  extended_entities?: Extendedentities;
  favorite_count: number;
  favorited: boolean;
  full_text: string;
  is_quote_status: boolean;
  lang: string;
  possibly_sensitive?: boolean;
  possibly_sensitive_editable?: boolean;
  quote_count: number;
  reply_count: number;
  retweet_count: number;
  retweeted: boolean;
  user_id_str: string;
  id_str: string;
  retweeted_status_result?: Retweetedstatusresult;
  in_reply_to_screen_name?: string;
  in_reply_to_status_id_str?: string;
  in_reply_to_user_id_str?: string;
  self_thread?: Selfthread;
  quoted_status_id_str?: string;
  quoted_status_permalink?: Quotedstatuspermalink;
}

interface Retweetedstatusresult {
  result: Result6;
}

interface Result6 {
  __typename: string;
  rest_id: string;
  core: Core2;
  unmention_data: any;
  edit_control: Editcontrol;
  views: Views2;
  source: string;
  legacy: Legacy4;
  quoted_status_result?: Quotedstatusresult;
  card?: Card;
  unified_card?: Unifiedcard;
}

interface Unifiedcard {
  card_fetch_state: string;
}

interface Card {
  rest_id: string;
  legacy: Legacy7;
}

interface Legacy7 {
  binding_values: Bindingvalue[];
  card_platform: Cardplatform;
  name: string;
  url: string;
  user_refs_results: any[];
}

interface Cardplatform {
  platform: Platform;
}

interface Platform {
  audience: Audience;
  device: Device;
}

interface Device {
  name: string;
  version: string;
}

interface Audience {
  name: string;
}

interface Bindingvalue {
  key: string;
  value: Value;
}

interface Value {
  string_value: string;
  type: string;
  scribe_key?: string;
}

interface Quotedstatusresult {
  result: Result5;
}

interface Result5 {
  __typename: string;
  rest_id: string;
  core: Core3;
  unmention_data: any;
  edit_control: Editcontrol;
  views: Views2;
  source: string;
  legacy: Legacy6;
}

interface Legacy6 {
  created_at: string;
  conversation_id_str: string;
  display_text_range: number[];
  entities: Entities5;
  extended_entities: Extendedentities3;
  favorite_count: number;
  favorited: boolean;
  full_text: string;
  is_quote_status: boolean;
  lang: string;
  possibly_sensitive: boolean;
  possibly_sensitive_editable: boolean;
  quote_count: number;
  reply_count: number;
  retweet_count: number;
  retweeted: boolean;
  user_id_str: string;
  id_str: string;
}

interface Extendedentities3 {
  media: Media6[];
}

interface Media6 {
  display_url: string;
  expanded_url: string;
  id_str: string;
  indices: number[];
  media_key: string;
  media_url_https: string;
  type: string;
  url: string;
  ext_media_color: Ok;
  ext_media_availability: Extmediaavailability;
  features: Features3;
  sizes: Sizes;
  original_info: Originalinfo2;
}

interface Entities5 {
  media: Media5[];
  user_mentions: any[];
  urls: any[];
  hashtags: any[];
  symbols: any[];
}

interface Media5 {
  display_url: string;
  expanded_url: string;
  id_str: string;
  indices: number[];
  media_url_https: string;
  type: string;
  url: string;
  features: Features3;
  sizes: Sizes;
  original_info: Originalinfo2;
}

interface Originalinfo2 {
  height: number;
  width: number;
  focus_rects: Face[];
}

interface Features3 {
  large: Large4;
  medium: Large4;
  small: Large4;
  orig: Large4;
}

interface Large4 {
  faces: Face[];
}

interface Core3 {
  user_results: Userresults4;
}

interface Userresults4 {
  result: Result4;
}

interface Result4 {
  __typename: string;
  id: string;
  rest_id: string;
  affiliates_highlighted_label: any;
  is_blue_verified: boolean;
  legacy: Legacy5;
  has_nft_avatar: boolean;
  super_follow_eligible: boolean;
  super_followed_by: boolean;
  super_following: boolean;
  business_account: any;
}

interface Legacy5 {
  protected: boolean;
  created_at: string;
  default_profile: boolean;
  default_profile_image: boolean;
  description: string;
  entities: Entities;
  fast_followers_count: number;
  favourites_count: number;
  followers_count: number;
  friends_count: number;
  has_custom_timelines: boolean;
  is_translator: boolean;
  listed_count: number;
  location: string;
  media_count: number;
  name: string;
  normal_followers_count: number;
  pinned_tweet_ids_str: any[];
  possibly_sensitive: boolean;
  profile_banner_extensions: Profilebannerextensions;
  profile_banner_url: string;
  profile_image_extensions: Profilebannerextensions;
  profile_image_url_https: string;
  profile_interstitial_type: string;
  screen_name: string;
  statuses_count: number;
  translator_type: string;
  url: string;
  verified: boolean;
  withheld_in_countries: any[];
}

interface Legacy4 {
  created_at: string;
  conversation_id_str: string;
  display_text_range: number[];
  entities: Entities4;
  extended_entities?: Extendedentities2;
  favorite_count: number;
  favorited: boolean;
  full_text: string;
  is_quote_status: boolean;
  lang: string;
  possibly_sensitive: boolean;
  possibly_sensitive_editable: boolean;
  quote_count: number;
  reply_count: number;
  retweet_count: number;
  retweeted: boolean;
  user_id_str: string;
  id_str: string;
  quoted_status_id_str?: string;
  quoted_status_permalink?: Quotedstatuspermalink;
  self_thread?: Selfthread;
}

interface Selfthread {
  id_str: string;
}

interface Quotedstatuspermalink {
  url: string;
  expanded: string;
  display: string;
}

interface Extendedentities2 {
  media: Media4[];
}

interface Media4 {
  display_url: string;
  expanded_url: string;
  id_str: string;
  indices: number[];
  media_key: string;
  media_url_https: string;
  type: string;
  url: string;
  ext_media_color: Ok;
  ext_media_availability: Extmediaavailability;
  features: Features2;
  sizes: Sizes;
  original_info: Originalinfo;
  additional_media_info?: Additionalmediainfo2;
  mediaStats?: MediaStats;
  video_info?: Videoinfo2;
  ext_alt_text?: string;
}

interface Videoinfo2 {
  aspect_ratio: number[];
  duration_millis: number;
  variants: Variant[];
}

interface Additionalmediainfo2 {
  title?: string;
  description?: string;
  monetizable: boolean;
  call_to_actions?: Calltoactions;
}

interface Calltoactions {
  watch_now: Watchnow;
}

interface Watchnow {
  url: string;
}

interface Entities4 {
  media?: Media3[];
  user_mentions: Usermention[];
  urls: Url[];
  hashtags: Hashtag[];
  symbols: any[];
}

interface Media3 {
  display_url: string;
  expanded_url: string;
  id_str: string;
  indices: number[];
  media_url_https: string;
  type: string;
  url: string;
  features: Features2;
  sizes: Sizes;
  original_info: Originalinfo;
}

interface Features2 {
  large?: Large3;
  medium?: Large3;
  small?: Large3;
  orig?: Large3;
}

interface Large3 {
  faces: Face[];
}

interface Views2 {
  count: string;
  state: string;
}

interface Core2 {
  user_results: Userresults3;
}

interface Userresults3 {
  result: Result3;
}

interface Result3 {
  __typename: string;
  id: string;
  rest_id: string;
  affiliates_highlighted_label: any;
  is_blue_verified: boolean;
  legacy: Legacy3;
  has_nft_avatar: boolean;
  super_follow_eligible: boolean;
  super_followed_by: boolean;
  super_following: boolean;
  business_account: any;
  professional?: Professional;
}

interface Legacy3 {
  protected: boolean;
  created_at: string;
  default_profile: boolean;
  default_profile_image: boolean;
  description: string;
  entities: Entities3;
  fast_followers_count: number;
  favourites_count: number;
  followers_count: number;
  friends_count: number;
  has_custom_timelines: boolean;
  is_translator: boolean;
  listed_count: number;
  location: string;
  media_count: number;
  name: string;
  normal_followers_count: number;
  pinned_tweet_ids_str: string[];
  possibly_sensitive: boolean;
  profile_banner_extensions: Profilebannerextensions;
  profile_banner_url: string;
  profile_image_extensions: Profilebannerextensions;
  profile_image_url_https: string;
  profile_interstitial_type: string;
  screen_name: string;
  statuses_count: number;
  translator_type: string;
  url?: string;
  verified: boolean;
  withheld_in_countries: any[];
  verified_type?: string;
}

interface Entities3 {
  description: Description2;
  url?: Url2;
}

interface Description2 {
  urls: Url[];
}

interface Extendedentities {
  media: Media2[];
}

interface Media2 {
  display_url: string;
  expanded_url: string;
  ext_alt_text?: string;
  id_str: string;
  indices: number[];
  media_key: string;
  media_url_https: string;
  type: string;
  url: string;
  ext_media_color: Ok;
  ext_media_availability: Extmediaavailability;
  features: Features;
  sizes: Sizes;
  original_info: Originalinfo;
  source_status_id_str?: string;
  source_user_id_str?: string;
  additional_media_info?: Additionalmediainfo;
  mediaStats?: MediaStats;
  video_info?: Videoinfo;
}

interface Videoinfo {
  aspect_ratio: number[];
  duration_millis?: number;
  variants: Variant[];
}

interface Variant {
  bitrate?: number;
  content_type: string;
  url: string;
}

interface MediaStats {
  viewCount: number;
}

interface Additionalmediainfo {
  title?: string;
  description?: string;
  monetizable: boolean;
  source_user?: Sourceuser;
  embeddable?: boolean;
}

interface Sourceuser {
  user_results: Userresults2;
}

interface Userresults2 {
  result: Result2;
}

interface Result2 {
  __typename: string;
  id: string;
  rest_id: string;
  affiliates_highlighted_label: any;
  is_blue_verified: boolean;
  legacy: Legacy2;
  has_nft_avatar: boolean;
  super_follow_eligible: boolean;
  super_followed_by: boolean;
  super_following: boolean;
  business_account: any;
}

interface Legacy2 {
  protected: boolean;
  created_at: string;
  default_profile: boolean;
  default_profile_image: boolean;
  description: string;
  entities: Entities;
  fast_followers_count: number;
  favourites_count: number;
  followers_count: number;
  friends_count: number;
  has_custom_timelines: boolean;
  is_translator: boolean;
  listed_count: number;
  location: string;
  media_count: number;
  name: string;
  normal_followers_count: number;
  pinned_tweet_ids_str: string[];
  possibly_sensitive: boolean;
  profile_banner_extensions: Profilebannerextensions;
  profile_banner_url: string;
  profile_image_extensions: Profilebannerextensions;
  profile_image_url_https: string;
  profile_interstitial_type: string;
  screen_name: string;
  statuses_count: number;
  translator_type: string;
  url: string;
  verified: boolean;
  verified_type?: string;
  withheld_in_countries: any[];
}

interface Extmediaavailability {
  status: string;
}

interface Entities2 {
  media?: Media[];
  user_mentions: Usermention[];
  urls: Url[];
  hashtags: Hashtag[];
  symbols: any[];
}

interface Hashtag {
  indices: number[];
  text: string;
}

interface Usermention {
  id_str: string;
  name: string;
  screen_name: string;
  indices: number[];
}

interface Media {
  display_url: string;
  expanded_url: string;
  id_str: string;
  indices: number[];
  media_url_https: string;
  type: string;
  url: string;
  features: Features;
  sizes: Sizes;
  original_info: Originalinfo;
  source_status_id_str?: string;
  source_user_id_str?: string;
}

interface Originalinfo {
  height: number;
  width: number;
  focus_rects?: Face[];
}

interface Sizes {
  large: Large2;
  medium: Large2;
  small: Large2;
  thumb: Large2;
}

interface Large2 {
  h: number;
  w: number;
  resize: string;
}

interface Features {
  large?: Large;
  medium?: Large;
  small?: Large;
  orig?: Large;
}

interface Large {
  faces: (Face | Face)[];
}

interface Face {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Views {
  count?: string;
  state: string;
}

interface Editcontrol {
  edit_tweet_ids: string[];
  editable_until_msecs: string;
  is_edit_eligible: boolean;
  edits_remaining: string;
}

interface Core {
  user_results: Userresults;
}

interface Userresults {
  result: Result;
}

interface Result {
  __typename: string;
  id: string;
  rest_id: string;
  affiliates_highlighted_label: any;
  is_blue_verified: boolean;
  legacy: Legacy;
  professional: Professional;
  has_nft_avatar: boolean;
  super_follow_eligible: boolean;
  super_followed_by: boolean;
  super_following: boolean;
  business_account: any;
}

interface Professional {
  rest_id: string;
  professional_type: string;
  category: Category[];
}

interface Category {
  id: number;
  name: string;
  icon_name: string;
}

interface Legacy {
  protected: boolean;
  created_at: string;
  default_profile: boolean;
  default_profile_image: boolean;
  description: string;
  entities: Entities;
  fast_followers_count: number;
  favourites_count: number;
  followers_count: number;
  friends_count: number;
  has_custom_timelines: boolean;
  is_translator: boolean;
  listed_count: number;
  location: string;
  media_count: number;
  name: string;
  normal_followers_count: number;
  pinned_tweet_ids_str: string[];
  possibly_sensitive: boolean;
  profile_banner_extensions: Profilebannerextensions;
  profile_banner_url: string;
  profile_image_extensions: Profilebannerextensions;
  profile_image_url_https: string;
  profile_interstitial_type: string;
  screen_name: string;
  statuses_count: number;
  translator_type: string;
  url: string;
  verified: boolean;
  verified_type: string;
  withheld_in_countries: any[];
}

interface Profilebannerextensions {
  mediaColor: MediaColor;
}

interface MediaColor {
  r: R;
}

interface R {
  ok: Ok;
}

interface Ok {
  palette: Palette[];
}

interface Palette {
  percentage: number;
  rgb: Rgb;
}

interface Rgb {
  blue: number;
  green: number;
  red: number;
}

interface Entities {
  description: any;
  url: Url2;
}

interface Url2 {
  urls: Url[];
}

interface Url {
  display_url: string;
  expanded_url: string;
  url: string;
  indices: number[];
}
