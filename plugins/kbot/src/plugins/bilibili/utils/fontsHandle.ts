/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-05 23:11:45
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-05 23:35:41
 * @FilePath: \koishi-plugin-kbot\plugins\kbot\src\plugins\bilibili\utils\fontsHandle.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { Config, logger } from "../dynamic";
import * as fs from "fs";
import path from "path";

export async function getFontsList(
  config: Config
): Promise<{ fontFamily: string; fontUrl: string }[]> {
  return new Promise((resolve) => {
    const needLoadFontList: { fontFamily: string; fontUrl: string }[] = [];

    if (config.fonts.enabled) {
      const fileNames = fs.readdirSync(
        path.resolve(__dirname, "../../../../../../public/fonts")
      );

      if (fileNames.length !== 0) {
        let trueFontFileNames = [];

        if (Object.keys(config.fonts?.fontsObjcet || {}).length > 0) {
          for (const fontName in Object.values(config.fonts.fontsObjcet)) {
            if (fileNames.includes(fontName)) {
              trueFontFileNames.push(fontName);
            }
          }
        }

        if (trueFontFileNames.length === 0) trueFontFileNames = [...fileNames];

        for (const fontFileName of trueFontFileNames) {
          try {
            const fileBuffer = fs.readFileSync(
              path.resolve(
                __dirname,
                `../../../../../../public/fonts/${fontFileName}`
              ),
              "binary"
            );

            needLoadFontList.push({
              fontFamily: `${fontFileName.split(".").join(" ")}`,
              fontUrl: `data:application/font-${fontFileName.split(".")[1]};base64,${Buffer.from(
                fileBuffer,
                "binary"
              ).toString("base64")}`,
            });
          } catch (err) {
            logger.error(`字体 ${fontFileName} 加载失败`, err);
          }
        }
      }
    }
    resolve(needLoadFontList);
  });
}
