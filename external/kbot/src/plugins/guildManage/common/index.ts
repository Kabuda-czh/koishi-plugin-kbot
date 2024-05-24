/*
 * @Author: Kabuda-czh
 * @Date: 2023-06-27 18:50:58
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-06-27 18:54:47
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\guildManage\common\index.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import type { Context } from 'koishi'
import { initGuildAdd } from './guildAdd'
import { initViolation } from './violation'

export async function initCommon(context: Context) {
  initViolation(context)
  initGuildAdd(context)
}
