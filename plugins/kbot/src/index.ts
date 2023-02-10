/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:28:53
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-10 10:37:42
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

export const usage = `
# 注意事项
内置多个插件，可在配置文件中配置启用插件\n
但注意，插件的配置项不是所有都是可选的，具体请查看插件的配置项
## 当前插件列表
- KBotBasic: 基础功能
- KBotManage: 群管理功能
- KBotBilibili: Bilibili 动态推送
- KBotMusic: 点歌功能
- KBotYoutube: Youtube 视频解析
## 权限问题
- 第一步: 设置机器人的超级管理员 QQ 号, 建议为自身 QQ 号, kbot 会自动创建该账号最高权限\n
\t若指令仍然提示权限不足, 请通过在左侧菜单栏中找到 \`数据库\` 选项点击进入\n
\t然后找到 \`user\` 表, 在右侧中找到自己的账号(如果没有先与机器人私聊一次)\n
\t最后双击 \`authority\` 格, 更改自己的权限并保存
- 第二步: 由于插件的权限问题，需要启用 koishi 内置的权限插件 \`Admin\`\n
\t并通过 \`authorize <value> -u <user>\` 指令来授权其他用户\n
\t详情请看链接 [authorize](https://koishi.chat/plugins/accessibility/admin.html#%E6%8C%87%E4%BB%A4-authorize)
`;

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

export async function apply(ctx: Context, config: Config) {

  ctx.command("kbot", "kbot 相关功能");

  ctx.plugin(botBasic, config.KBotBasic);

  if (config.KBotManage.enabled) ctx.plugin(managePlugin, config.KBotManage);
  if (config.KBotBilibili.enabled)
    ctx.plugin(bilibiliPlugin, config.KBotBilibili);
  if (config.KBotMusic.enabled) ctx.plugin(musicPlugin, config.KBotMusic);
  if (config.KBotYoutube.enabled) ctx.plugin(youtubePlugin, config.KBotYoutube);
}
