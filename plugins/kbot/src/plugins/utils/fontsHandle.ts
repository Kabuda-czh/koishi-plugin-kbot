/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-05 23:11:45
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-23 17:12:30
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\utils\fontsHandle.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import * as fs from "fs";
import { Dict, Logger } from "koishi";
import path from "path";

export async function getFontsList(
  logger: Logger
): Promise<{ fontFamily: string; fontUrl: string }[]> {
  return new Promise((resolve) => {
    const needLoadFontList: { fontFamily: string; fontUrl: string }[] = [];

    const fileNames = fs.readdirSync(
      path.resolve(__dirname, "../../assets/fonts")
    );

    for (const fontFileName of fileNames) {
      try {
        const fileBuffer = fs.readFileSync(
          path.resolve(
            __dirname,
            `../../assets/fonts/${fontFileName}`
          ),
          "binary"
        );

        needLoadFontList.push({
          fontFamily: `${fontFileName.split(".").join(" ")}`,
          fontUrl: `data:application/font-${
            fontFileName.split(".")[1]
          };base64,${Buffer.from(fileBuffer, "binary").toString("base64")}`,
        });
      } catch (err) {
        logger.error(`字体 ${fontFileName} 加载失败`, err);
      }
    }
    resolve(needLoadFontList);
  });
}
