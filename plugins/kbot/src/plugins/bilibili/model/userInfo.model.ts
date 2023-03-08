/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-30 17:18:43
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-01-30 17:21:17
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\bilibili\model\userInfo.model.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
export interface BilibiliUserInfoApiData {
  code: number
  message: string
  ttl: number
  data: UserInfo
}

interface UserInfo {
  mid: number
  name: string
  sex: string
  face: string
  face_nft: number
  face_nft_type: number
  sign: string
  rank: number
  level: number
  jointime: number
  moral: number
  silence: number
  coins: number
  fans_badge: boolean
  fans_medal: Fansmedal
  official: Official
  vip: Vip
  pendant: Pendant
  nameplate: Nameplate
  user_honour_info: Userhonourinfo
  is_followed: boolean
  top_photo: string
  theme: Theme
  sys_notice: Theme
  live_room: Liveroom
  birthday: string
  school: School
  profession: Profession
  tags?: any
  series: Series
  is_senior_member: number
  mcn_info?: any
  gaia_res_type: number
  gaia_data?: any
  is_risk: boolean
  elec: Elec
  contract?: any
}

interface Elec {
  show_info: Showinfo
}

interface Showinfo {
  show: boolean
  state: number
  title: string
  icon: string
  jump_url: string
}

interface Series {
  user_upgrade_status: number
  show_upgrade_window: boolean
}

interface Profession {
  name: string
  department: string
  title: string
  is_show: number
}

interface School {
  name: string
}

interface Liveroom {
  roomStatus: number
  liveStatus: number
  url: string
  title: string
  cover: string
  roomid: number
  roundStatus: number
  broadcast_type: number
  watched_show: Watchedshow
}

interface Watchedshow {
  switch: boolean
  num: number
  text_small: string
  text_large: string
  icon: string
  icon_location: string
  icon_web: string
}

interface Theme {
}

interface Userhonourinfo {
  mid: number
  colour?: any
  tags: any[]
}

interface Nameplate {
  nid: number
  name: string
  image: string
  image_small: string
  level: string
  condition: string
}

interface Pendant {
  pid: number
  name: string
  image: string
  expire: number
  image_enhance: string
  image_enhance_frame: string
}

interface Vip {
  type: number
  status: number
  due_date: number
  vip_pay_type: number
  theme_type: number
  label: Label
  avatar_subscript: number
  nickname_color: string
  role: number
  avatar_subscript_url: string
  tv_vip_status: number
  tv_vip_pay_type: number
}

interface Label {
  path: string
  text: string
  label_theme: string
  text_color: string
  bg_style: number
  bg_color: string
  border_color: string
  use_img_label: boolean
  img_label_uri_hans: string
  img_label_uri_hant: string
  img_label_uri_hans_static: string
  img_label_uri_hant_static: string
}

interface Official {
  role: number
  title: string
  desc: string
  type: number
}

interface Fansmedal {
  show: boolean
  wear: boolean
  medal?: any
}
