/*
 * @Author: Kabuda-czh
 * @Date: 2023-04-07 13:01:39
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-04-07 13:29:33
 * @FilePath: \KBot-App\plugins\kbot\src\basic\tts\enum.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
export enum StyleEnum {
  affectionate = '以较高的音调和音量表达温暖而亲切的语气',
  angry = '表达生气和厌恶的语气',
  assistant = '热情而轻松的语气',
  calm = '以沉着冷静的态度说话',
  chat = '表达轻松随意的语气',
  cheerful = '表达积极愉快的语气',
  customerservice = '友好热情的语气',
  depressed = '调低音调和音量来表达忧郁、沮丧的语气',
  disgruntled = '表达轻蔑和抱怨的语气',
  embarrassed = '在说话者感到不舒适时表达不确定、犹豫的语气',
  empathetic = '表达关心和理解',
  envious = '当你渴望别人拥有的东西时，表达一种钦佩的语气',
  fearful = '以较高的音调、较高的音量和较快的语速来表达恐惧、紧张的语气',
  gentle = '以较低的音调和音量表达温和、礼貌和愉快的语气',
  lyrical = '以优美又带感伤的方式表达情感',
  'narration-professional' = '以专业、客观的语气朗读内容',
  'narration-relaxed' = '为内容阅读表达一种舒缓而悦耳的语气',
  newscast = '以正式专业的语气叙述新闻',
  'newscast-casual' = '以通用、随意的语气发布一般新闻',
  'newscast-formal' = '以正式、自信和权威的语气发布新闻',
  sad = '表达悲伤语气',
  serious = '表达严肃和命令的语气',
  shouting = '就像从遥远的地方说话或在外面说话，但能让自己清楚地听到',
  'advertisement-upbeat' = '用兴奋和精力充沛的语气推广产品或服务',
  'sports-commentary' = '用轻松有趣的语气播报体育赛事',
  'sports-commentary-excited' = '用快速且充满活力的语气播报体育赛事精彩瞬间',
  whispering = '说话非常柔和，发出的声音小且温柔',
  terrified = '表达一种非常害怕的语气，语速快且声音颤抖。 听起来说话人处于不稳定的疯狂状态',
  unfriendly = '表达一种冷淡无情的语气',
}

export enum RoleEnum {
  Girl = '模拟女孩',
  Boy = '模拟男孩',
  YoungAdultFemale = '模拟年轻成年女性',
  YoungAdultMale = '模拟年轻成年男性',
  OlderAdultFemale = '模拟年长的成年女性',
  OlderAdultMale = '模拟年长的成年男性',
  SeniorFemale = '模拟老年女性',
  SeniorMale = '模拟老年男性',
}

export enum KbitrateEnum {
  '16khz-32kbitrate(mp3)' = 'audio-16khz-32kbitrate-mono-mp3',
  '16khz-128kbitrate(mp3)' = 'audio-16khz-128kbitrate-mono-mp3',
  '24khz-160kbitrate(mp3)' = 'audio-24khz-160kbitrate-mono-mp3',
  '48khz-192kbitrate(mp3)' = 'audio-48khz-192kbitrate-mono-mp3',
  '16khz-16bit-mono-pcm(wav)' = 'riff-16khz-16bit-mono-pcm',
  '24khz-16bit-mono-pcm(wav)' = 'riff-24khz-16bit-mono-pcm',
  '48khz-16bit-mono-pcm(wav)' = 'riff-48khz-16bit-mono-pcm',
}

export enum TTSApiEnum {
  SpeekList = 'https://www.text-to-speech.cn/getSpeekList.php',
  Speek = 'https://www.text-to-speech.cn/getSpeek.php',
}
