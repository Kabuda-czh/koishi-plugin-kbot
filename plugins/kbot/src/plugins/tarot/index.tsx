/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:28:53
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-07-11 18:08:07
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\tarot\index.tsx
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import type { Context } from 'koishi'
import { Logger, Schema, sleep } from 'koishi'
import GeneratePath from '../../config'
import shuffle from './shuffle'
import { cards, meanings } from './tarot.config'

export interface IConfig { }

export const Config: Schema<IConfig> = Schema.object({})

export const logger = new Logger('KBot-plugin-tarot')

export async function apply(ctx: Context) {
  const cardLength = Object.keys(cards).length

  const { tarotImagesDir } = GeneratePath.getInstance(ctx.baseDir).getGeneratePathData()

  ctx.command('kbot/抽塔罗牌', '抽单张塔罗牌', {
    checkArgCount: true,
    showWarning: false,
  }).action(async ({ session }) => {
    const randomIndex = Math.floor(Math.random() * cardLength)
    let cardKey = Object.keys(cards)[randomIndex]
    let imageFile = `${pathToFileURL(path.join(`${tarotImagesDir}`, `${cardKey}.jpg`))}`
    let cardValue = ''

    // 特殊: 愚者有两张
    if (cardKey === '愚者') {
      const rand = Math.floor(Math.random() * 2 + 1)
      imageFile = `${pathToFileURL(path.join(`${tarotImagesDir}`, `愚者${rand}.jpg`))}`
    }

    // 特殊: 正位和逆位
    if (typeof cards[cardKey] === 'object') {
      const rand = Math.floor(Math.random() * 2 + 1)
      cardValue = rand === 1 ? cards[cardKey].正位 : cards[cardKey].逆位
      cardKey += rand === 1 ? '（正位）' : '（逆位）'
    }
    else {
      cardValue = cards[cardKey]
    }

    await session.send(<image url={imageFile} />)

    sleep(1500)

    return <message>
      <p>锵锵锵，塔罗牌的预言是~</p>
      <p>{cardKey}</p>
      <p>其释义为: {cardValue}</p>
    </message>
  })

  ctx.command('kbot/塔罗牌', '塔罗牌阵', {
    checkArgCount: true,
    showWarning: false,
  }).action(async ({ session }) => {
    const indiceArray = Array.from({ length: cardLength }, (_, i) => i + 1)
    const randomIndices = new Set<number>()
    while (randomIndices.size < 4) {
      const index = Math.floor(Math.random() * indiceArray.length + 1)
      if (!randomIndices.has(index))
        randomIndices.add(index)
    }
    const indices = [...randomIndices]
    const cardKeys = shuffle(Object.keys(cards))
    const chain = []
    const timesKeys = []
    let rand: number, imageFile: string, cardKey: string, cardValue: string

    for (let i = 0; i < indices.length; i++) {
      const index = indices[i]
      cardKey = cardKeys[index - 1]

      if (!cardKey) {
        logger.error('cardKey is undefined', cardKey, indices)
        return '出现未知问题，请联系管理员'
      }

      const meaningKey = Object.keys(meanings)[i]
      const meaningValue = meanings[meaningKey]
      imageFile = `${pathToFileURL(path.join(`${tarotImagesDir}`, `${cardKey}.jpg`))}`

      // 特殊: 愚者有两张
      if (cardKey === '愚者') {
        rand = Math.floor(Math.random() * 2 + 1)
        imageFile = `${pathToFileURL(path.join(`${tarotImagesDir}`, `愚者${rand}.jpg`))}`
      }

      // 特殊: 正位和逆位
      if (typeof cards[cardKey] === 'object') {
        rand = Math.floor(Math.random() * 2 + 1)
        cardValue = rand === 1 ? cards[cardKey].正位 : cards[cardKey].逆位
        cardKey += rand === 1 ? '（正位）' : '（逆位）'
      }
      else {
        cardValue = cards[cardKey]
      }

      const msg = `${meaningKey}，${meaningValue}\n${cardKey}，${cardValue}`
      timesKeys.push(cardKey)
      chain.push({
        text: `第 ${i + 1} 轮`,
        msg,
        imageFile,
      })
    }

    await session.send(`你抽到了：${timesKeys.join(' -- ')}`)

    return <message forward>
      {chain.map((msg) => {
        return <message>
          <author user-id={session.selfId} />
          <p>{msg.text}</p>
          <p>{msg.msg}</p>
          <image url={msg.imageFile} />
        </message>
      })}
    </message>
  })
}
