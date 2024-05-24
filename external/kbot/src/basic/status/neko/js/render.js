/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-15 23:03:33
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-16 11:05:03
 * @FilePath: \KBot-App\plugins\kbot\src\basic\status\neko\js\render.js
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
const parser = new DOMParser()

function stringToElement(str) {
  return parser.parseFromString(str, 'text/html').body.childNodes[0]
}

function action(config) {
  const nameInstance = document.querySelector('#config_name')
  const dashboardColor = ['var(--main-color)', '#ffb3cc', '#fcaa93', '#b7a89e']
  const dashboardInstance = document.querySelector('#config_dashboard')
  const informationInstance = document.querySelector('#config_information')
  const footerInstance = document.querySelector('#config_footer')

  nameInstance.innerHTML = config.name
  footerInstance.innerHTML = config.footer
  dashboardInstance.append(
    ...config.dashboard.map((item, index) =>
      stringToElement(
        `<li
                class="__dashboard-block __cpu"
                style="--block-color: ${dashboardColor[index]}"
                >
                <svg
                    width="102"
                    height="102"
                    viewBox="0 0 200 200"
                    class="__dashboard-block__progress circle-progress"
                    style="--progress: ${item.progress}; --color: var(--block-color)"
                >
                    <circle
                    class="circle-progress-bar"
                    stroke-linecap="round"
                    cx="100"
                    cy="100"
                    r="94"
                    fill="none"
                    transform="rotate(-93.8 100 100)"
                    stroke-width="12"
                    />
                </svg>
                <div class="__dashboard-block__info">
                    <p class="__dashboard-block__info__value">${item.title}</p>
                </div>
            </li>
        `,
      ),
    ),
  )

  informationInstance.append(
    ...config.information.map(item =>
      stringToElement(
        `
            <li class="__information-block">
                <span class="__information-block__key">${item.key}</span>
                <span class="__information-block__value">${item.value}</span>
            </li>
        `,
      ),
    ),
  )
}

async function setFont(needLoadFontList) {
  // 字体按需加载方法
  await (async () => {
    const code = needLoadFontList.reduce((defaultString, fontObject) => {
      return (
        `${defaultString
        }@font-face { font-family: ${fontObject.fontFamily};src: url('${fontObject.fontUrl}'); }`
      )
    }, '')
    const style = document.createElement('style')
    style.rel = 'stylesheet'
    style.appendChild(document.createTextNode(code))
    const head = document.getElementsByTagName('head')[0]
    head.appendChild(style)
  })()
}
