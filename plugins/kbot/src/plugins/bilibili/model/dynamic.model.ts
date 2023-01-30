/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-30 17:18:37
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-01-30 17:19:30
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\bilibili\model\dynamic.model.ts
 * @Description: 
 * 
 * Copyright (c) 2023 by ${git_name}, All Rights Reserved.
 */
export interface DynamicNotifiction {
  botId: string;
  bilibiliId: string;
  bilibiliName: string;
  // The time won't be presisted in database.
  // We just find a place to record the time.
  lastUpdated?: number;
}

export type BilibiliDynamicItem =
  | {
      type: "DYNAMIC_TYPE_AV";
      id_str: string;
      modules: {
        module_author: {
          name: string;
          pub_ts: number;
        };
        module_dynamic: {
          major: {
            archive: {
              title: string;
              cover: string;
            };
          };
        };
      };
    }
  | {
      type: "DYNAMIC_TYPE_DRAW";
      id_str: string;
      modules: {
        module_author: {
          name: string;
          pub_ts: number;
        };
        module_dynamic: {
          desc: {
            text: string;
          };
          major: {
            draw: {
              items: {
                src: string;
              }[];
            };
          };
        };
      };
    }
  | {
      type: "DYNAMIC_TYPE_WORD";
      id_str: string;
      modules: {
        module_author: {
          name: string;
          pub_ts: number;
        };
        module_dynamic: {
          desc: {
            text: string;
          };
        };
      };
    }
  | {
      type: "DYNAMIC_TYPE_FORWARD";
      id_str: string;
      orig: BilibiliDynamicItem;
      modules: {
        module_author: {
          name: string;
          pub_ts: number;
        };
        module_dynamic: {
          desc: {
            text: string;
          };
        };
      };
    }
  | {
      type: "DYNAMIC_TYPE_LIVE_RCMD";
      id_str: string;
      modules: {
        module_author: {
          name: string;
          pub_ts: number;
        };
        module_dynamic: {
          major: {
            live_rcmd: {
              content: string;
            };
          };
        };
      };
    };