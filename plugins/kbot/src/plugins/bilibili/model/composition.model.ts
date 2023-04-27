/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-09 17:09:26
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-09 17:09:55
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\bilibili\model\composition.model.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
export interface MemberCard {
  ts: number
  code: number
  card: Card
}

interface Card {
  mid: string
  name: string
  approve: boolean
  sex: string
  rank: string
  face: string
  coins: number
  DisplayRank: string
  regtime: number
  spacesta: number
  place: string
  birthday: string
  sign: string
  description: string
  article: number
  attentions: number[]
  fans: number
  friend: number
  attention: number
  level_info: Levelinfo
  pendant: Pendant
  official_verify: Officialverify
  nameplate: Nameplate
}

interface Nameplate {
  nid: number
  name: string
  image: string
  image_small: string
  level: string
  condition: string
}

interface Officialverify {
  type: number
  desc: string
}

interface Pendant {
  pid: number
  name: string
  image: string
  expire: number
}

interface Levelinfo {
  next_exp: number
  current_level: number
  current_min: number
  current_exp: number
}

export interface MedalWall {
  code: number
  message: string
  ttl: number
  data: Data
}

interface Data {
  list: List[]
  count: number
  close_space_medal: number
  only_show_wearing: number
  name: string
  icon: string
  uid: number
  level: number
}

export interface List {
  medal_info: Medalinfo
  target_name: string
  target_icon: string
  link: string
  live_status: number
  official: number
}

interface Medalinfo {
  target_id: number
  level: number
  medal_name: string
  medal_color_start: number
  medal_color_end: number
  medal_color_border: number
  guard_level: number
  wearing_status: number
  medal_id: number
  intimacy: number
  next_intimacy: number
  today_feed: number
  day_limit: number
  guard_icon: string
  honor_icon: string
}
