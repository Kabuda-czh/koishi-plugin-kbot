/*
 * @Author: Kabuda-czh
 * @Date: 2023-04-17 11:18:24
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-04-17 14:06:05
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\guildManage\command\index.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import type { Context } from 'koishi'
import { initRecall } from './recall'
import { initBlackList } from './blackList'

export async function initCommand(context: Context) {
  initRecall(context)
  initBlackList(context)
}
