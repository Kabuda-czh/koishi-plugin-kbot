/*
 * @Author: Kabuda-czh
 * @Date: 2023-03-16 17:54:12
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-03-16 19:36:27
 * @FilePath: \KBot-App\plugins\kbot\src\basic\status\random\js\render.js
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
const parser = new DOMParser()

function stringToElement(str) {
  return parser.parseFromString(str, 'text/html').body.childNodes[0]
}

function fixValue(value, num = 0) {
  return value.toFixed(num)
}

function action(config, base64Image, botId) {
  document.querySelector('#app').style.backgroundImage = `url(data:image/png;base64,${base64Image})`

  const imageInstance = document.querySelector('.__panel__head')
  imageInstance.src = `https://q1.qlogo.cn/g?b=qq&nk=${botId}&s=640`

  const nameInstance = document.querySelector('.__panel__name__text')
  const footerSpanInstance = document.querySelector('.footer__span')
  nameInstance.innerHTML = 'KBot'
  footerSpanInstance.innerHTML = config.footerSpan

  const headerInfoInstance = document.querySelector('#card-header > .__info')
  const functionsInstance = document.querySelector('#card-function')
  const diskInstance = document.querySelector('#card-disk > .__chart')
  const footerInstance = document.querySelector('#card-footer')

  headerInfoInstance.append(
    ...config.systemInfo.map(item =>
      stringToElement(
        `<div class="__info__block">
          <span class="__info__block__title">${item.title}</span>
          <span class="__info__block__value">${item.value}</span>
        </div>`,
      ),
    ),
  )

  functionsInstance.append(
    ...Object.entries(config.functions).map(([key, value]) =>
      stringToElement(`
      <div class="__item">
        <div class="__item__status green"></div>
        <span class="__item__name">${key}</span>
        <ul class="__item__progress">
          ${Array.from({ length: 12 }, (_, i) => `<li${i < Math.floor(value.progress * 12) ? ' class="full"' : ''}></li>`).join('')}
        </ul>
        ${Object.values(value.args).map(item => `<span class="__item__args">${item}</span>`).join('')}
      </div>
      `),
    ),
  )

  diskInstance.append(
    ...config.disks.map(item =>
      stringToElement(`
          <div class="__chart__block">
            <div class="__chart__block____title">
              <div class="__chart__block____title__circle">
                <svg viewBox="0 0 150 150" style="--progress: ${fixValue(item.use, 4)}">
                  <circle cx="70" cy="70" r="70"></circle>
                  <circle cx="70" cy="70" r="70"></circle>
                </svg>
              </div>
              <div class="__chart__block____title__info">
                <p class="__title">${item.fs}</p>
                <p class="__value">${fixValue(item.used / 1024 ** 3, 2)}GB / ${fixValue(item.size / 1024 ** 3, 2)}GB</p>
              </div>
            </div>
          </div>
      `),
    ),
  )

  footerInstance.append(
    ...Object.entries(config.footer).map(([key, value]) =>
      stringToElement(`
      <div class="__footer__block">
        <p class="__footer__block__title">${key}</p>
        <p class="__footer__block__value">${value}</p>
      </div>
      `),
    ),
  )
}
