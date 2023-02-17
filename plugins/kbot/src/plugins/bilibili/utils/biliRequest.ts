/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-03 16:34:11
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-17 14:52:24
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\bilibili\utils\biliRequest.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { Quester } from "koishi";
import { BilibiliDynamicType } from "../enum";
import { MemberCard, MedalWall } from "../model";
import { StringFormat } from "../../utils";

export async function getDynamic(http: Quester, uid: string) {
  return await http.get(
    StringFormat(BilibiliDynamicType.DynamicDetailURL, uid),
    {
      headers: {
        Referer: `https://space.bilibili.com/${uid}/dynamic`,
      },
    }
  );
}

export async function searchUser(keyword: string, http: Quester) {
  const data = { keyword: keyword, search_type: "bili_user" };

  try {
    const resp = await http
      .get(BilibiliDynamicType.SearchUserByApp, { params: data })
      .catch((e) => {
        if (e.response.status === 412) {
          return http
            .get(BilibiliDynamicType.SearchUserByPC, { params: data })
            .then((resp) => {
              return resp;
            });
        }
      });
    return resp.data;
  } catch (e) {
    throw new Error("Failed to search user." + e);
  }
}

export async function getMemberCard(http: Quester, uid: string) {
  try {
    const resp = await http.get<MemberCard>(
      StringFormat(BilibiliDynamicType.MemberCardURL, uid)
    );
    return resp;
  } catch (e) {
    throw new Error("Failed to get member card." + e);
  }
}

export async function getMedalWall(http: Quester, uid: string, cookie: string) {
  try {
    const resp = await http.get<MedalWall>(
      StringFormat(BilibiliDynamicType.MedalWallURL, uid), {
        headers: {
          Referer: `https://space.bilibili.com/${uid}/medal`,
          cookie: cookie
        }
      }
    );

    if (resp.code === -101) throw new Error("cookie is invalid");

    return resp;
  } catch (e) {
    throw new Error(`Failed to get medal wall [${e.message}]`);
  }
}
