<div align="center">

# KBot

[![install size](https://packagephobia.com/badge?p=koishi-plugin-kbot)](https://packagephobia.com/result?p=koishi-plugin-kbot)
![Platform](https://img.shields.io/badge/platform-Koishi-blueviolet)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FKabuda-czh%2Fkoishi-plugin-kbot.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2FKabuda-czh%2Fkoishi-plugin-kbot?ref=badge_shield)

![GitHub forks](https://img.shields.io/github/forks/Kabuda-czh/koishi-plugin-kbot?style=social)
![GitHub Repo stars](https://img.shields.io/github/stars/Kabuda-czh/koishi-plugin-kbot?style=social)

[![License](https://img.shields.io/github/license/Kabuda-czh/koishi-plugin-kbot)](https://github.com/Kabuda-czh/koishi-plugin-kbot/blob/master/LICENSE)
[![wakatime](https://wakatime.com/badge/user/e6e4d351-af56-4ce7-8c0a-0b372c53962d/project/5df1a406-9c51-43c0-9a9f-28ac2cb16d2f.svg)](https://wakatime.com/badge/user/e6e4d351-af56-4ce7-8c0a-0b372c53962d/project/5df1a406-9c51-43c0-9a9f-28ac2cb16d2f)
![QQ](https://img.shields.io/badge/Tencent_QQ-634469564-ff69b4)

![NodeJs Version](https://img.shields.io/badge/NodeJs-18-blue)

![!](https://count.getloli.com/get/@koishi-plugin-kbot?theme=rule34)

基于 [koishi](../../../../koishijs/koishi) 搭建的高效、多功能 [QQ](../../../../Mrs4s/go-cqhttp) 机器人

</div>

---

- **koishi-plugin-kbot**
  - [功能](#功能)
  - [安装](#安装)
  - [使用方法](#使用方法)
  - [注意事项](#注意事项)
  - [Todo](#todo)
  - [感谢](#感谢)
  - [借鉴](#借鉴)
  - [License](#license)

## 功能

- 基础娱乐功能:
  <details>

    <summary>KBotBasic 基础功能</summary>

    **一言**: 随机一言

    **人间**: 随机发送散文集《我在人间凑数的日子》句子

    **今日新闻**: 获取60秒看世界新闻 (来源于: [ALAPI](https://www.alapi.cn/))

    **天气**: 查询国内天气 (来源于: [ALAPI](https://www.alapi.cn/))

    **自检**: 通过图的形式发送机器人的运行状态

    **TTS**: 语音合成 (来源于: [text-to-speech](https://www.text-to-speech.cn/))
  </details>

  <details>

    <summary>KBotManage 群管功能</summary>

    **WebUI**: 通过网页的形式管理机器人, 可以禁言/解禁, 踢出群聊, 发送消息等

    **撤回消息**: 批量撤回用户消息, 但需要机器人权限

    **黑名单**: 全局黑名单, 添加全局黑名单且可以全局检查机器人所在的所有群并踢出黑名单用户

  </details>

  <details>

    <summary>KBotBilibili b站订阅相关功能</summary>

    **订阅/删除**: 订阅/删除b站up主

    **查看最新动态**: 查看up主最新动态

    **查看订阅列表**: 查看订阅的up主列表

    **查成分**: 查看up主关注的成分(**仅供娱乐**)

    **查弹幕**: 查看up主近期进入的直播间以及发送的弹幕(**仅供娱乐**)
  </details>

  <details>

    <summary>KBotTwitter 推特订阅相关功能</summary>

    **订阅/删除**: 订阅/删除推特博主

    **查看最新动态**: 查看推特博主最新动态

    **查看订阅列表**: 查看订阅的推特博主列表
  </details>

  <details>

    <summary>KBotTarot 塔罗牌功能</summary>

    **塔罗牌**: 抽取单张塔罗牌或者抽取塔罗牌阵
  </details>

  <details>

    <summary>KBotMusic 点歌功能</summary>

    **点歌**: 通过关键词点歌(拥有 qq/网易云 平台)
  </details>

  <details>

    <summary>KBotYoutube 油管视频解析功能</summary>

    **视频解析**: 通过监测到的油管视频链接解析视频信息 (需要API v3)
  </details>
- 游戏功能:
  <details>

    <summary>KBotValorant 无畏契约功能(开发中)</summary>

    **查战绩**: 查看玩家的战绩

    **查看每日商店**: 查看每日商店的商品
  </details>

## 安装

1. 下载插件运行平台 [Koishi](https://koishi.chat/)
2. 在插件平台的 **`插件市场`** 中搜索 **`kbot`** 并安装

## 使用方法

1. 基础功能:

   - 一言: `一言`
   - 人间: `人间`
   - 今日新闻: `今日新闻`
   - 天气: `天气`
   - 自检: `自检`
   - TTS: `tts <文本>` 例如: `tts 你好`

2. 群管功能:

    - 撤回消息: `guildmanage.recall <用户QQ> [消息数量]`
      - 参数说明: `用户QQ` 为必填参数, `消息数量` 为可选参数, 默认为 1
      - 别名: `批量撤回`
      - 例如: `guildmanage.recall -c 10 123456` 撤回用户 `123456` 的 `10` 条消息
    - 黑名单拉黑: `guildmanage.blacklist <用户QQ> [拉黑原因]`
      - 参数说明: `用户QQ` 为必填参数, `拉黑原因` 为可选参数, 默认为 无
      - 别名: `全局拉黑`
      - 例如: `guildmanage.blacklist -r 大笨蛋 123456` 拉黑用户 `123456`, 并且原因为 `大笨蛋`
    - 黑名单检查: `guildmanage.checkblacklist`
      - 参数说明: 无
      - 别名: `复核全群黑名单`

3. b站订阅功能:

    - 订阅: `bilibili -a <upInfo>`
      - 参数说明: `upInfo` 为必填参数, 为 `up主` 的 `uid` 或者 `up主` 的名称
      - 例如:
        - `bilibili -a 123456` 订阅 `uid` 为 `123456` 的 `up主`
        - `bilibili -a xxx` 订阅 `名称` 为 `xxx` 的 `up主`
    - 删除: `bilibili -r <upInfo>`
      - 参数说明: `upInfo` 为必填参数, 为 `up主` 的 `uid` 或者 `up主` 的名称
      - 例如:
        - `bilibili -r 123456` 删除 `uid` 为 `123456` 的 `up主`
        - `bilibili -r xxx` 删除 `名称` 为 `xxx` 的 `up主`
    - 查看最新动态: `bilibili -s <upInfo>`
      - 参数说明: `upInfo` 为必填参数, 为 `up主` 的 `uid` 或者 `up主` 的名称
      - 例如:
        - `bilibili -s 123456` 查看 `uid` 为 `123456` 的 `up主` 的最新动态
        - `bilibili -s xxx` 查看 `名称` 为 `xxx` 的 `up主` 的最新动态
    - 查看订阅列表: `bilibili -l`
      - 参数说明: 无
    - 查成分: `bilibili -v <upInfo>`
      - 参数说明: `upInfo` 为必填参数, 为 `up主` 的 `uid` 或者 `up主` 的名称
      - 例如:
        - `bilibili -v 123456` 查看 `uid` 为 `123456` 的 `up主` 的关注并解析成分
        - `bilibili -v xxx` 查看 `名称` 为 `xxx` 的 `up主` 的关注并解析成分
    - 查弹幕: `bilibili -d <upInfo>`
      - 参数说明: `upInfo` 为必填参数, 为 `up主` 的 `uid` 或者 `up主` 的名称
      - 例如:
        - `bilibili -d 123456` 查看 `uid` 为 `123456` 的 `up主` 的近期弹幕
        - `bilibili -d xxx` 查看 `名称` 为 `xxx` 的 `up主` 的近期弹幕

4. 推特订阅功能

    - 订阅: `twitter -a <userId>`
      - 参数说明: `userId` 为必填参数, 为 `博主` 的 **@后的字符串**
      - 例如:
        - `twitter -a xxx` 订阅 **twitterId** 为 `@xxx` 的 `博主`
    - 删除: `twitter -r <userId>`
      - 参数说明: `userId` 为必填参数, 为 `博主` 的 **@后的字符串**
      - 例如:
        - `twitter -r xxx` 删除 **twitterId** 为 `@xxx` 的 `博主`
    - 查看最新动态: `twitter -s <userId>`
      - 参数说明: `userId` 为必填参数, 为 `博主` 的 **@后的字符串**
      - 例如:
        - `twitter -s xxx` 查看 **twitterId** 为 `@xxx` 的 `博主` 的最新动态
    - 查看订阅列表: `twitter -l`
      - 参数说明: 无

5. 点歌功能

    - 点歌: `music <name> [点歌平台]`
      - 参数说明: `name` 为必填参数, 为 `歌曲名称`, `点歌平台` 为可选参数, 默认为 `qq` (可以自行在配置页面配置默认平台)
      - 例如:
        - `music xxx` 点歌 `xxx`
        - `music -p netease xxx` 点歌 `xxx` (指定为 `netease` 平台)

6. 塔罗牌功能

    - 塔罗牌: `抽塔罗牌`
      - 参数说明: 无
    - 塔罗牌阵: `塔罗牌`
      - 参数说明: 无

## 注意事项

- 插件的配置项不是所有都是可选的，具体请查看插件页面中的配置项
- ~~在使用插件时, `messages` 插件依赖与 `sqlite` 数据库可能会有**内存泄漏**的问题, 建议使用其他数据库~~
- 如果使用带图功能, 需要启用 `puppeteer` 插件, 那么内存的消耗可能会达到 `2G ~ 3G` 左右, 请注意

## Todo

- [x] **基础功能**
  - [x] **根据权限自动同意邀请进群**
  - [x] **TTS**
- [ ] **群管功能**
  - [ ] **WebUI - 修改头衔**
  - [ ] **WebUI - 修改群名**
  - [x] **WebUI - 修改群公告**
  - [ ] **WebUI - 修改群简介**
  - [x] **WebUI - 修改群头像**
  - [ ] **WebUI - 设置监控群消息**
  - [x] **WebUI - 设置群屏蔽词**
  - [x] **WebUI - 设置群加群验证**
  - [x] **根据屏蔽词监控群聊**
  - [x] **对于加群用户进行群验证**
  - [x] **撤回消息**
  - [x] **添加黑名单**
  - [x] **复核全群黑名单**
  - [ ] **展示黑名单**
  - [ ] **删除黑名单**
- [ ] **Valorant**
  - [ ] **查询战绩**
  - [ ] **查询赛事**
  - [ ] **查询商店**
- [ ] **彩虹六号**
  - [ ] **查询战绩**
  - [ ] **查询赛事**

## 感谢

- [koishijs](https://github.com/koishijs/koishi): 感谢 Koishi 官方提供的插件开发框架, 以及技术指导
- [medicago087](https://github.com/medicago087): 对于 `bug` 的反馈

## 借鉴

- [koishi-plugin-music](https://github.com/koishijs/koishi-plugin-music)
- [koishi-plugin-bilibili](https://github.com/Anillc/koishi-plugin-bilibili)
- [ZeroBot-Plugin](https://github.com/FloatTech/ZeroBot-Plugin/tree/master)
- [koishi-plugin-music](https://github.com/koishijs/koishi-plugin-music)
- [tarot_hoshino](https://github.com/haha114514/tarot_hoshino)
- [koishi-plugin-youtube](https://github.com/tediorelee/koishi-plugin-youtube)

## 赞助

- [爱发电](https://afdian.net/a/kbd-dev)

## License

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FKabuda-czh%2Fkoishi-plugin-kbot.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2FKabuda-czh%2Fkoishi-plugin-kbot?ref=badge_large)
