/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:28:53
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-07 15:36:15
 * @FilePath: \KBot-App\plugins\kbot\src\basic\index.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { Context, Schema } from "koishi";

export interface Config {
  superAdminQQ: string;
}

export const Config: Schema<Config> = Schema.object({
  superAdminQQ: Schema.string().required().description("超级管理员QQ号 (必填)"),
});

export const using = ['database']

export function apply(ctx: Context, config: Config) {
  ctx.database.getUser("onebot", config.superAdminQQ).then((user) => {
    if (user) {
      ctx.database.setUser("onebot", config.superAdminQQ, {
        authority: 5,
      });
    } else {
      ctx.database.createUser("onebot", config.superAdminQQ, {
        authority: 5,
      });
    }
  })
}
