/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-02 10:29:59
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-02 10:30:06
 * @FilePath: \KBot-App\plugins\kbot\client\utils\common\object.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
/** 设置对象数据 */
export function objectAssign<T extends Record<string, any>>(target: T, source: Partial<T>) {
  Object.assign(target, source)
}
