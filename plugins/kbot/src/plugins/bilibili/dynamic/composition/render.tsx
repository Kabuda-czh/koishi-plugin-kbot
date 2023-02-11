/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-11 15:12:57
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-11 18:36:29
 * @FilePath: \koishi-plugin-kbot\plugins\kbot\src\plugins\bilibili\dynamic\composition\render.tsx
 * @Description: 
 * 
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { MemberCard, List } from "../../model";

export function renderVup(
  searchUserCardInfo: MemberCard,
  vups: any[],
  vupsLength: number,
  medalMap: { [key: string]: List },
  needLoadFontList?: {
    fontFamily: string;
    fontUrl: string;
  }[]
) {
  return <html>
    <style>
      {`
      * {
        margin: 0;
        padding: 0;
      }

      ${loadFont(needLoadFontList)[0]}

      .flex-cc {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .uid {
        color: #696969;
        background-color: #DDDDDD;
        border-radius: 2px;
        font-size: 11px;
        padding: 0 5px;
      }

      .medalBg {
        background-color: #F6F6F6;
      }

      .padding-x5 {
        padding: 0 5px;
      }

      #card {
        font-size: 12px;
        font-family: ${loadFont(needLoadFontList)[1]};
      }

      .header {
        display: flex;
        align-items: center;
      }

      .headerImg {
        height: 120px;
        width: 120px;
      }

      .info {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        width: 100%;
        margin: 0 10px;
        font-size: 10px;
      }

      .info div {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 10px;
        width: 100%;
      }

      .vup {
        display: flex;
        flex-direction: column;
        width: 100%;
      }

      .vupInfo {
        display: flex;
        align-items: center;
        padding: 10px;
        gap: 5px;
      }
    `}
    </style>
    <div id="card">
      <div class="header">
        <img class="headerImg" src={searchUserCardInfo.card.face} />
        <div class="info">
          <div>
            <p>{searchUserCardInfo.card.name}</p>
            <p class="uid">{searchUserCardInfo.card.mid}</p>
          </div>
          <div>
            <p style="margin-right: 20px">粉丝: {searchUserCardInfo.card.fans}</p>
            <p>关注: {searchUserCardInfo.card.attentions.length}</p>
          </div>
          <div>
            <p>管人痴成分:&nbsp;
              {(vupsLength
                /
                searchUserCardInfo.card.attentions.length * 100).toFixed(2)}% 
              ({vupsLength} / {searchUserCardInfo.card.attentions.length})
            </p>
          </div>
          <div>
            <p>注册日期: {new Date(searchUserCardInfo.card.regtime * 1000).toLocaleString()}</p>
          </div>
          <div>
            <p>查询日期: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
      <div class="vup">
        {
          vups.map((vup, index) => {
            if (medalMap[vup.mid] && medalMap[vup.mid].medal_info.level) {
              return <div class={(index % 2) && "medalBg"}>
                <div class="vupInfo">
                  <p>{vup.uname}</p>
                  <div class="flex-cc uid">
                    <p>{vup.mid}</p>
                  </div>
                  {
                    <div class="flex-cc" style={{
                      backgroundImage: `linear-gradient(to right, ${int2rgb(medalMap[vup.mid].medal_info.medal_color_start)}, ${int2rgb(medalMap[vup.mid].medal_info.medal_color_end)})`,
                      border: `1px solid ${int2rgb(medalMap[vup.mid].medal_info.medal_color_border)}`,
                    }}>
                      <p class="padding-x5" style={{
                        color: "#FFF",
                      }}>
                        {medalMap[vup.mid].medal_info.medal_name}
                      </p>
                      <p class="padding-x5" style={{
                        backgroundColor: "#FFF",
                        color: `${int2rgb(medalMap[vup.mid].medal_info.medal_color_border)}`
                      }}>
                        {medalMap[vup.mid].medal_info.level}
                      </p>
                    </div>
                  }
                </div>
              </div>
            }
          })
        }
      </div>
    </div>
  </html>
}

function int2rgb(int: number) {
  const r = int >> 16;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `rgb(${r}, ${g}, ${b})`
}

function loadFont(needLoadFontList: { fontFamily: string; fontUrl: string; }[]) {
  const fontFace = needLoadFontList.reduce((defaultString, fontObject) => {
    return (
      defaultString +
      `@font-face { font-family: ${fontObject.fontFamily};src: url('${fontObject.fontUrl}'); }`
    );
  }, "");

  let needLoadFont = needLoadFontList.reduce(
    (defaultString, fontObject) => defaultString + fontObject.fontFamily + ",",
    ""
  );

  needLoadFont = needLoadFont + "Microsoft YaHei, Helvetica Neue ,Helvetica, Arial, sans-serif"
  return [fontFace, needLoadFont]
}