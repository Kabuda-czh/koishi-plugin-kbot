/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-15 23:03:33
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-15 23:04:02
 * @FilePath: \koishi-plugin-kbot\plugins\kbot\src\basic\status\renderA\src\types.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */

interface DashboardRow {
  progress: number;
  title: string;
}

interface InformationRow {
  key: string;
  value: string;
}

interface DashboardConfig {
  name: string;
  dashboard: [DashboardRow, DashboardRow, DashboardRow, DashboardRow];
  information: [InformationRow, InformationRow, InformationRow, InformationRow];
  footer: string;
}
