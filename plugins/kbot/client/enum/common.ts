/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-02 10:30:33
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-02 10:30:44
 * @FilePath: \KBot-App\plugins\kbot\client\enum\common.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
/** 数据类型 */
export enum EnumDataType {
  number = '[object Number]',
  string = '[object String]',
  boolean = '[object Boolean]',
  null = '[object Null]',
  undefined = '[object Undefined]',
  object = '[object Object]',
  array = '[object Array]',
  function = '[object Function]',
  date = '[object Date]',
  regexp = '[object RegExp]',
  promise = '[object Promise]',
  set = '[object Set]',
  map = '[object Map]',
  file = '[object File]',
}
