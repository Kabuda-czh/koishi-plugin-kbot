/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:28:53
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-01-31 16:16:32
 * @FilePath: \KBot-App\plugins\kbot\client\index.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by ${git_name}, All Rights Reserved.
 */
import { Context } from '@koishijs/client'
import ManageIndex from './index.vue'

export default (ctx: Context) => {
  ctx.page({
    name: '群管理页面',
    path: '/groupManage',
    component: ManageIndex,
  })
}
