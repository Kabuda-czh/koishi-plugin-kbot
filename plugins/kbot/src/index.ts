/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:28:53
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-01-31 17:04:31
 * @FilePath: \KBot-App\plugins\kbot\src\index.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { Context, Schema } from "koishi";

import * as botBasic from "./basic";

import * as bilibiliPlugin from "./plugins/bilibili";
import * as musicPlugin from "./plugins/music";
import * as youtubePlugin from "./plugins/youtube";
import * as managePlugin from "./plugins/guildManage";

export const name = "kbot";

interface IPluginEnableConfig {
  enabled: boolean;
}

interface Config {
  KBotBasic?: botBasic.Config;
  KBotManage?: managePlugin.Config & IPluginEnableConfig;
  KBotBilibili?: bilibiliPlugin.Config & IPluginEnableConfig;
  KBotMusic?: musicPlugin.Config & IPluginEnableConfig;
  KBotYoutube?: youtubePlugin.Config & IPluginEnableConfig;
}

const pluginLoad = <T>(schema: Schema<T>): Schema<T & IPluginEnableConfig> =>
  Schema.intersect([
    Schema.object({
      enabled: Schema.boolean().default(false).description("是否启用插件"),
    }),
    Schema.union([
      Schema.object({
        enabled: Schema.const(true).required(),
        ...schema.dict,
      }),
      Schema.object({}),
    ]) as Schema<T>,
  ]);

export const Config: Schema<Config> = Schema.object({
  KBotBasic: botBasic.Config,
  KBotManage: pluginLoad(managePlugin.Config).description("群管理功能"),
  KBotBilibili: pluginLoad(bilibiliPlugin.Config).description(
    "Bilibili 动态推送"
  ),
  KBotMusic: pluginLoad(musicPlugin.Config).description("点歌功能"),
  KBotYoutube: pluginLoad(youtubePlugin.Config).description("Youtube 视频解析"),
});

export function apply(ctx: Context, config: Config) {
  ctx.plugin(botBasic, config.KBotBasic);

  if (config.KBotManage.enabled) ctx.plugin(managePlugin, config.KBotManage);
  if (config.KBotBilibili.enabled)
    ctx.plugin(bilibiliPlugin, config.KBotBilibili);
  if (config.KBotMusic.enabled) ctx.plugin(musicPlugin, config.KBotMusic);
  if (config.KBotYoutube.enabled) ctx.plugin(youtubePlugin, config.KBotYoutube);
}
