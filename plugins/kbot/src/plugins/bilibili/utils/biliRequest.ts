/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-03 16:34:11
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-06 11:40:29
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\bilibili\utils\biliRequest.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { Quester } from "koishi";

export async function getDynamic(http: Quester, uid: string) {
  return await http.get(
    "https://api.bilibili.com/x/polymer/web-dynamic/v1/feed/space?host_mid=" +
      uid,
    {
      headers: {
        Referer: `https://space.bilibili.com/${uid}/dynamic`,
      },
    }
  );
}

export async function searchUser(keyword: string, http: Quester) {
  const appURL = "https://api.bilibili.com/x/web-interface/search/type";
  const pcURL = "https://api.bilibili.com/x/web-interface/wbi/search/type";
  const data = { keyword: keyword, search_type: "bili_user" };

  try {
    const resp = await http.get(appURL, { params: data }).catch((e) => {
      if (e.response.status === 412) {
        return http.get(pcURL, { params: data }).then((resp) => {
          return resp;
        });
      }
    });
    return resp.data;
  } catch (e) {
    throw new Error("Failed to search user." + e);
  }
}
