/*
 * @Author: Kabuda-czh
 * @Date: 2023-03-10 14:26:39
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-05-09 11:28:39
 * @FilePath: \KBot-App\plugins\kbot\client\interface\manage.interface.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
export interface UserInfo {
  userId: string
  username: string
  avatar?: string
  nickname?: string
}

export interface Group {
  group_id: number
  group_name: string
  member_count: number
  max_member_count: number
}

export interface GroupConfig {
  role?: string
  checked?: boolean
}

export interface GroupCommand {
  id?: number
  name: string
  disable: boolean
  parent: string
  children: GroupCommand[]
  hasChildren: boolean
}

export type GroupList = Group & GroupConfig
