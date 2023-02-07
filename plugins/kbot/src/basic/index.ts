/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:28:53
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-07 10:57:37
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

export function apply(ctx: Context, config: Config) {
  
}
