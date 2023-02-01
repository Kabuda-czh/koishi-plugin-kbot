/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-30 12:09:42
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-01 10:34:42
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\guildManage\index.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
// TODO developing
import { Context, Schema } from "koishi";
import { resolve } from "path";
import {} from "@koishijs/plugin-console";
import { routerStrategies } from "./router";

export interface Config {}

export const Config: Schema<Config> = Schema.object({});

export const using = ["console"] as const;

export function apply(context: Context, config: Config) {
  Object.keys(routerStrategies).forEach((key) => {
    context.router["get"](key, routerStrategies[key](context));
  });

  context.using(["console"], (ctx) => {
    ctx.console.addEntry({
      dev: resolve(__dirname, "../../../client/index.ts"),
      prod: resolve(__dirname, "../../../dist"),
    });
  });
}
