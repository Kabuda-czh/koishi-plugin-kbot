/*
 * @Author: Kabuda-czh
 * @Date: 2023-06-28 15:44:26
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-06-28 15:46:13
 * @FilePath: \KBot-App\plugins\kbot\client\api\image.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { http } from '../utils'

export function fetchImageInfo(imageBase64: string) {
  return http.request('post', '/imageInfo', { image: imageBase64 })
}
