/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-15 23:03:33
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-15 23:03:54
 * @FilePath: \koishi-plugin-kbot\plugins\kbot\src\basic\status\renderA\src\main.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import "../scss/font-import.scss";
import "../scss/circle-progress.scss";
import "../scss/style.scss";
import { action } from "./action";

action({
  name: "Shizuku",
  dashboard: [
    {
      progress: 0.78,
      title: "78% - 4.8Ghz",
    },
    {
      progress: 0.46,
      title: "283,1 / 600,0 MB",
    },
    {
      progress: 0.3,
      title: "244,8 / 409,6 MB",
    },
    {
      progress: 0.151,
      title: "15.1 / 100 GB",
    },
  ],
  information: [
    {
      key: "CPU",
      value: "12th Gen Intel(R) Core(TM) i5-12490F",
    },
    {
      key: "System",
      value: "Microsoft Windows 11 Pro for Workstations",
    },
    {
      key: "Version",
      value: "14.2.1",
    },
    {
      key: "Plugins",
      value: "72 loaded",
    },
  ],
  footer: "已持续运行 21天 13小时 32分钟",
});
