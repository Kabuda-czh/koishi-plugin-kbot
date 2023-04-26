/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:28:53
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-04-25 11:43:06
 * @FilePath: \KBot-App\plugins\kbot\src\basic\tts\index.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { type Context, Logger, Schema, segment } from 'koishi'
import { TTSApiEnum } from './enum'

export interface IConfig {
  language?: string
  voice?: string
  style?: string
  styledegree?: string
  role?: string
  silence?: number
  rate?: number
  pitch?: number
}

export const Config: Schema<IConfig> = Schema.object({})

export const logger = new Logger('KBot-tts')

export async function apply(ctx: Context, _config: IConfig) {
  ctx.command('kbot/tts <text:string>', '文字转语音')
    .option('language', '-l <language:string> 语言')
    .option('voice', '-v <voice:string> 语音')
    .option('role', '-r <role:string> 模仿')
    .option('style', '-s <style:string> 感情')
    .option('kbitrate', '-k <kbitrate:string> 比特率')
    .option('silence', '-i <silence:number> 静音')
    .option('styledegree', '-d <styledegree:string> 感情强度')
    .option('rate', '-t <rate:number> 语速 (-100 ~ 200)')
    .option('pitch', '-p <pitch:number> 音调 (-50 ~ 50)')
    .action(async ({ options }, text) => {
      const params = {
        language: '中文（普通话，简体）',
        voice: 'zh-CN-XiaoxiaoNeural',
        text,
        role: '0',
        style: '0',
        styledegree: '1',
        rate: 0,
        pitch: 0,
        kbitrate: 'audio-16khz-32kbitrate-mono-mp3',
        silence: '',
      }

      Object.assign(params, options)

      const formData = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&')

      const { data } = await ctx.http.axios(TTSApiEnum.Speek, {
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })

      return segment.audio(data.download)
    })
}
