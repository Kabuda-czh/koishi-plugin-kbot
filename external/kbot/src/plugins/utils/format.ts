/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-06 12:50:16
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-17 14:50:50
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\utils\format.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
export function StringFormat(
  str: string,
  ...args: (string | number)[]
): string {
  args.forEach((arg) => {
    str = str.replace(/%s/, arg.toString())
  })
  return str
}
