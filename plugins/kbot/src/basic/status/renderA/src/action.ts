/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-15 23:03:33
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-15 23:03:42
 * @FilePath: \koishi-plugin-kbot\plugins\kbot\src\basic\status\renderA\src\action.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
const parser = new DOMParser();

function stringToElement<T extends HTMLElement>(str: string): T {
  return parser.parseFromString(str, "text/html").body.childNodes[0] as T;
}

export function action(config: DashboardConfig) {
  const nameInstance = document.querySelector<HTMLSpanElement>("#config_name");
  const dashboardColor = ["var(--main-color)", "#ffb3cc", "#fcaa93", "#b7a89e"];
  const dashboardInstance =
    document.querySelector<HTMLUListElement>("#config_dashboard");
  const informationInstance = document.querySelector<HTMLUListElement>(
    "#config_information"
  );
  const footerInstance =
    document.querySelector<HTMLParagraphElement>("#config_footer");
    
  nameInstance!.innerHTML = config.name;
  footerInstance!.innerHTML = config.footer;
  dashboardInstance!.append(
    ...config.dashboard.map((item, index) =>
      stringToElement<HTMLLIElement>(`
            <li
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
        `)
    )
  );

  informationInstance!.append(
    ...config.information.map((item) =>
      stringToElement<HTMLLIElement>(`
            <li class="__information-block">
                <span class="__information-block__key">${item.key}</span>
                <span class="__information-block__value">${item.value}</span>
            </li>
        `)
    )
  );
}
