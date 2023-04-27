/*
 * @Author: Kabuda-czh
 * @Date: 2023-03-03 10:14:30
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-03-03 11:20:29
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\bilibili\model\danmuku.model.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
export interface DanmukuData {
  code: number
  message: string
  data: Data
}

interface Data {
  data: Info[]
  total: number
  pageNum: number
  pageSize: number
  hasMore: boolean
}

interface Info {
  channel: Channel
  live: Live
  danmakus: Danmakus[]
}

interface Danmakus {
  name: string
  type: number
  uId: number
  sendDate: number
  price?: number
  message?: string
  ct?: any
}

interface Live {
  liveId: string
  title: string
  area: string
  parentArea: string
  isFinish: boolean
  isFull: boolean
  coverUrl: string
  startDate: number
  stopDate: number
  danmakusCount: number
  totalIncome: number
  watchCount: number
  likeCount: number
  interactionCount: number
}

interface Channel {
  name: string
  isLiving: boolean
  uId: number
  roomId: number
  faceUrl: string
  tags: string[]
  totalLiveCount: number
  totalDanmakuCount: number
  totalIncome: number
  totalLiveSecond: number
  lastLiveDate: number
}
