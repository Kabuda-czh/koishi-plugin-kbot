/*
 * @Author: Kabuda-czh
 * @Date: 2023-04-07 13:13:06
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-04-10 11:18:56
 * @FilePath: \KBot-App\plugins\kbot\src\basic\tts\utils.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh,
 * All Rights Reserved.
 */
interface VoiceStyle {
  style_arr: string[]
  role_arr?: string[]
}

export function getVoiceStyle(voice: string): VoiceStyle {
  switch (voice) {
    case 'zh-CN-XiaohanNeural':
      return {
        style_arr: [
          'calm',
          'fearful',
          'cheerful',
          'disgruntled',
          'serious',
          'angry',
          'sad',
          'embarrassed',
          'affectionate',
          'gentle',
          'serious',
        ],
      }
    case 'zh-CN-XiaomengNeural':
      return {
        style_arr: [
          'chat',
        ],
      }
    case 'zh-CN-XiaomoNeural':
      return {
        style_arr: [
          'embarrassed',
          'calm',
          'fearful',
          'cheerful',
          'disgruntled',
          'serious',
          'angry',
          'sad',
          'depressed',
          'affectionate',
          'gentle',
          'envious',
        ],
        role_arr: [
          'YoungAdultFemale',
          'YoungAdultMale',
          'OlderAdultFemale',
          'OlderAdultMale',
          'SeniorFemale',
          'SeniorMale',
          'Girl',
          'Boy',
        ],
      }
    case 'zh-CN-XiaoruiNeural':
      return {
        style_arr: [
          'calm',
          'fearful',
          'angry',
          'sad',
        ],
      }
    case 'zh-CN-XiaoshuangNeural':
      return {
        style_arr: [
          'chat',
        ],
      }
    case 'zh-CN-XiaoxiaoNeural':
      return {
        style_arr: [
          'assistant',
          'chat',
          'customerservice',
          'newscast',
          'affectionate',
          'angry',
          'calm',
          'cheerful',
          'disgruntled',
          'fearful',
          'gentle',
          'lyrical',
          'sad',
          'serious',
          'friendly',
          'poetry-reading',
        ],
      }
    case 'zh-CN-XiaoxuanNeural':
      return {
        style_arr: [
          'calm',
          'fearful',
          'cheerful',
          'disgruntled',
          'serious',
          'angry',
          'gentle',
          'depressed',
        ],
        role_arr: [
          'YoungAdultFemale',
          'YoungAdultMale',
          'OlderAdultFemale',
          'OlderAdultMale',
          'SeniorFemale',
          'SeniorMale',
          'Girl',
          'Boy',
        ],
      }
    case 'zh-CN-XiaoyiNeural':
      return {
        style_arr: [
          'angry',
          'disgruntled',
          'affectionate',
          'cheerful',
          'fearful',
          'sad',
          'embarrassed',
          'serious',
          'gentle',
        ],
      }
    case 'zh-CN-XiaozhenNeural':
      return {
        style_arr: [
          'angry',
          'disgruntled',
          'cheerful',
          'fearful',
          'sad',
          'serious',
        ],
      }
    case 'zh-CN-YunfengNeural':
      return {
        style_arr: [
          'angry',
          'cheerful',
          'depressed',
          'disgruntled',
          'fearful',
          'sad',
          'serious',
        ],
      }
    case 'zh-CN-YunhaoNeural':
      return {
        style_arr: [
          'advertisement-upbeat',
        ],
      }
    case 'zh-CN-YunjianNeural':
      return {
        style_arr: [
          'narration-relaxed',
          'sports-commentary',
          'sports-commentary-excited',
        ],
      }
    case 'zh-CN-YunxiaNeural':
      return {
        style_arr: [
          'calm',
          'fearful',
          'cheerful',
          'angry',
          'sad',
        ],
      }
    case 'zh-CN-YunxiNeural':
      return {
        style_arr: [
          'narration-relaxed',
          'embarrassed',
          'fearful',
          'cheerful',
          'disgruntled',
          'serious',
          'angry',
          'sad',
          'depressed',
          'chat',
          'assistant',
          'newscast',
        ],
        role_arr: [
          'Narrator',
          'YoungAdultMale',
          'Boy',
        ],
      }
    case 'zh-CN-YunyangNeural':
      return {
        style_arr: [
          'customerservice',
          'narration-professional',
          'newscast-casual',
        ],
      }
    case 'zh-CN-YunyeNeural':
      return {
        style_arr: [
          'embarrassed',
          'calm',
          'fearful',
          'cheerful',
          'disgruntled',
          'serious',
          'angry',
          'sad',
        ],
        role_arr: [
          'YoungAdultFemale',
          'YoungAdultMale',
          'OlderAdultFemale',
          'OlderAdultMale',
          'SeniorFemale',
          'SeniorMale',
          'Girl',
          'Boy',
        ],
      }
    case 'zh-CN-YunzeNeural':
      return {
        style_arr: [
          'calm',
          'fearful',
          'cheerful',
          'disgruntled',
          'serious',
          'angry',
          'sad',
          'depressed',
          'documentary-narration',
        ],
        role_arr: [
          'OlderAdultMale',
          'SeniorMale',
        ],
      }
    default:
      return {
        style_arr: [
          'affectionate',
          'angry',
          'assistant',
          'calm',
          'chat',
          'cheerful',
          'customerservice',
          'depressed',
          'disgruntled',
          'embarrassed',
          'empathetic',
          'envious',
          'fearful',
          'gentle',
          'lyrical',
          'narration-professional',
          'narration-relaxed',
          'newscast',
          'newscast-casual',
          'newscast-formal',
          'sad',
          'serious',
          'shouting',
          'advertisement-upbeat',
          'gentle',
          'sports-commentary',
          'sports-commentary-excited',
          'whispering',
          'terrified',
          'unfriendly',
        ],
        role_arr: [
          'YoungAdultFemale',
          'YoungAdultMale',
          'OlderAdultFemale',
          'OlderAdultMale',
          'SeniorFemale',
          'SeniorMale',
          'Girl',
          'Boy',
        ],
      }
  }
}

// export async function getSpeekList(ctx: Context) {
//   const { data } = await ctx.http.axios(TTSApiEnum.SpeekList, {
//     method: 'POST',
//   })
//     .then(res => res)
//     .catch(() => null)
//   if (data)
//     await fs.promises.writeFile(ttsListPath, JSON.stringify(data))
//   return data
// }
