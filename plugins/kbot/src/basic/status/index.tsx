/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:28:53
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-14 17:26:39
 * @FilePath: \KBot-App\plugins\kbot\src\basic\status\index.tsx
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { Context, Schema } from "koishi";

export interface Config {
  
}

export const Config: Schema<Config> = Schema.object({
  
});

export async function apply(ctx: Context, config: Config) {
  ctx.command("checkBody", "检查机器人状态")
    .shortcut("检查身体")
    .action(async ({ session }) => {
      // TODO 渲染
    });
}
