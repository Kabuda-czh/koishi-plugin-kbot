/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:28:53
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-03-09 14:35:40
 * @FilePath: \KBot-App\plugins\kbot\client\index.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import type { Context } from '@koishijs/client'
import ManageIndex from './index.vue'

export default (ctx: Context) => {
  ctx.page({
    name: '群管理页面',
    path: '/groupManage',
    authority: 4,
    component: ManageIndex,
  })
}
