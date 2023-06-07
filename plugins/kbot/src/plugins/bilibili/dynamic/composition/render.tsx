/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-11 15:12:57
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-06-07 10:04:44
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\bilibili\dynamic\composition\render.tsx
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { loadFont } from '../../../utils'
import type { DanmukuData, List, MemberCard } from '../../model'

export async function renderVup(
  searchUserCardInfo: MemberCard,
  vups: any[],
  vupsLength: number,
  medalMap: { [key: string]: List },
  needLoadFontList: {
    fontFamily: string
    fontUrl: string
  }[],
) {
  const loadList = await loadFont(needLoadFontList)
  return <html>
  <style>
    {`
    * {
      margin: 0;
      padding: 0;
    }

    ${loadList[0]}

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
      font-family: ${loadList[1]};
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
                / searchUserCardInfo.card.attentions.length * 100).toFixed(2)}%
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
          ...vups.map((vup, index) => {
            if (medalMap[vup.mid] && medalMap[vup.mid].medal_info.level) {
              return <div class={(index % 2) && 'medalBg'}>
                <div class="vupInfo">
                  <p>{vup.uname}</p>
                  <div class="flex-cc uid">
                    <p>{vup.mid}</p>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundImage: `linear-gradient(to right, ${int2rgb(medalMap[vup.mid].medal_info.medal_color_start)}, ${int2rgb(medalMap[vup.mid].medal_info.medal_color_end)})`,
                    border: `1px solid ${int2rgb(medalMap[vup.mid].medal_info.medal_color_border)}`,
                  }}>
                    <p class="padding-x5" style={{
                      color: '#FFF',
                    }}>
                        {medalMap[vup.mid].medal_info.medal_name}
                    </p>
                    <p class="padding-x5" style={{
                      backgroundColor: '#FFF',
                      color: `${int2rgb(medalMap[vup.mid].medal_info.medal_color_border)}`,
                    }}>
                        {medalMap[vup.mid].medal_info.level}
                    </p>
                  </div>
                </div>
              </div>
            }
            return null
          })
        }
      </div>
    </div>
</html>
}

export async function renderDanmu(
  searchUserCardInfo: MemberCard,
  danmukuData: DanmukuData,
  needLoadFontList: {
    fontFamily: string
    fontUrl: string
  }[]) {
  const danmuMap = {
    0: '普通消息',
    1: '礼物',
    2: '上舰',
    3: 'Superchat',
    4: '进入直播间',
    5: '标题变动',
    6: '分区变动',
    7: '直播中止',
    8: '直播继续',
  }

  const loadList = await loadFont(needLoadFontList)

  return <html>
    <style>{`
      * {
        margin: 0;
        padding: 0;
      }

      ${loadList[0]}

      #card {
        font-size: 12px;
        font-family: ${loadList[1]};
      }

      .user {
        display: flex;
        align-items: center;
      }

      .userFace, .upFace {
        height: 100px;
        width: 100px;
      }

      .uid {
        color: #696969;
        background-color: #DDDDDD;
        border-radius: 2px;
        font-size: 11px;
        padding: 0 5px;
      }

      .userInfo {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
        width: 100%;
        margin: 0 10px;
        font-size: 10px;
      }

      .userInfo div {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 10px;
        width: 100%;
      }

      .danmu {
        margin-top: 10px;
        font-size: 8px;
      }

      .upData {
        display: flex;
        padding-left: 10px;
        padding-right: 10px;
      }

      .roomData {
        margin-left: 15px;
      }

      .danmuData {
        margin-top: 3px;
      }

      .nameTitleColor {
        color: rgb(24, 144, 255);
      }

      .redColor {
        color: rgb(255, 0, 0);
      }

      .greenColor {
        color: rgb(0, 128, 0);
      }
    `}</style>
    <div id="card">
      <div class="user">
        <img class="userFace" src={searchUserCardInfo.card.face} />
        <div class="userInfo">
          <div>
            <p>{searchUserCardInfo.card.name}</p>
            <p class="uid">{searchUserCardInfo.card.mid}</p>
          </div>
          <div>
            <p style="margin-right: 20px">粉丝: {searchUserCardInfo.card.fans}</p>
            <p>关注: {searchUserCardInfo.card.attentions.length}</p>
          </div>
          <div>
            <p>页码 [0 / {Math.floor((danmukuData.data.total - 1) / 5)}]</p>
          </div>
          <div>
            <p>网页链接: https://danmakus.com/user/{searchUserCardInfo.card.mid}</p>
          </div>
        </div>
      </div>
      <div class="danmukuDatas">
        {
          danmukuData.data.data.map((item) => {
            return <div class="danmu">
              <div class="upData">
                <img class="upFace" src={item.channel.faceUrl} />
                <div class="roomData">
                  <p class="nameTitleColor">标题: {item.live.title}</p>
                  <p class="nameTitleColor">主播: {item.channel.name}</p>
                  <p>开始时间: {new Date(item.live.startDate).toLocaleString()}</p>
                  <p>结束时间: {
                    item.live.isFinish
                      ? new Date(item.live.stopDate).toLocaleString()
                      : <span class="greenColor">正在直播</span>
                  }</p>
                  <p>直播时长: {
                    `${(
                      ((item.live.isFinish ? item.live.stopDate : Date.now()) - item.live.startDate) / 3600000
                    ).toFixed(1)}小时`}
                  </p>
                  <p>弹幕数量: {item.live.danmakusCount}</p>
                  <p>观看次数: {item.live.watchCount}</p>
                  <p>收益: <span class="redColor">￥{item.live.totalIncome}</span></p>
                </div>
              </div>
              <div class="danmuData">
                {
                  item.danmakus.map((danmu) => {
                    let messageInfo
                    switch (danmu.type) {
                      case 0:
                        messageInfo = [<span>{danmu.message}</span>]
                        break
                      case 1:
                        messageInfo = [
                          <span>{danmuMap[danmu.type]}</span>,
                          <span>&nbsp;&nbsp;</span>,
                          <span>{danmu.message}</span>]
                        break
                      case 2:
                      case 3:
                      {
                        const color = danmu.type === 3 ? 'rgb(0, 85, 255)' : 'rgb(128, 0, 128)'
                        messageInfo = [
                          <span style={{ color }}>{danmuMap[danmu.type]}</span>,
                          <span>&nbsp;&nbsp;</span>,
                          <span style={{ color }}>{danmu.message}[</span>,
                          <span class="redColor">￥{+danmu.price.toFixed(1)}]</span>,
                          <span style={{ color }}>]</span>]
                        break
                      }
                      case 4:
                      case 5:
                      case 6:
                      case 7:
                      case 8:
                        messageInfo = [<span class="greenColor">{danmuMap[danmu.type]}</span>]
                        break
                      default:
                        messageInfo = [<span>未知类型 {danmu.type}</span>]
                        break
                    }
                    return <p>
                      <span>{new Date(danmu.sendDate).toLocaleTimeString()}</span>
                      &nbsp;&nbsp;
                      <span class="nameTitleColor">{danmu.name}</span>
                      &nbsp;&nbsp;
                      {...messageInfo}
                    </p>
                  })
                }
              </div>
            </div>
          })
        }
      </div>
    </div>
  </html >
}

function int2rgb(int: number) {
  const r = int >> 16
  const g = (int >> 8) & 255
  const b = int & 255
  return `rgb(${r}, ${g}, ${b})`
}
