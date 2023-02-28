/*
 * @Author: Kabuda-czh
 * @Date: 2023-02-03 13:40:55
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-28 14:16:09
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\twitter\dynamic\listen.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { Channel, Context, Dict, Logger } from "koishi";
import { Config, logger } from ".";
import { DynamicNotifiction, Entry } from "../model";
import { renderFunction } from "./render";

export async function* listen(
  list: Dict<
    [
      Pick<Channel, "id" | "guildId" | "platform" | "twitter">,
      DynamicNotifiction
    ][]
  >,
  request: (restId: string, ctx: Context, logger: Logger, isPure?: boolean) => Promise<Entry[]>,
  ctx: Context,
  config: Config
) {
  while (true) {
    const entries = Object.entries(list);
    if (entries.length === 0) {
      yield;
      continue;
    }
    for (const [restId, notifications] of entries) {
      if (notifications.length === 0) continue;
      const time = notifications[0][1].lastUpdated;
      try {
        const items = await request(restId, ctx, logger, config.usePure);
        if (items.length === 0) continue;
        // setup time on every start up
        if (!notifications[0]?.[1].lastUpdated) {
          notifications.forEach(
            ([, notification]) =>
              (notification.lastUpdated =
                new Date(
                  items[0]?.content.itemContent?.tweet_results?.result?.legacy?.created_at
                ).getTime() / 1000 || Math.ceil(+new Date() / 1000))
          );
          continue;
        }
        let neo = items.filter(
          (item) =>
            new Date(
              item.content.itemContent?.tweet_results?.result?.legacy?.created_at || 0
            ).getTime() /
              1000 >
            time
        );
        if (neo.length !== 0) {
          const rendered = await Promise.all(
            neo.map((item) => renderFunction(ctx, item, config))
          );

          rendered.forEach((text, index) => {
            notifications.forEach(([channel, notification]) => {
              notification.lastUpdated =
                new Date(
                  neo[
                    index
                  ].content.itemContent?.tweet_results?.result?.legacy?.created_at
                ).getTime() / 1000  || Math.ceil(+new Date() / 1000);
              ctx.bots[notification.botId].sendMessage(
                channel.id,
                text,
                channel.guildId
              );
            });
          });
        }
      } catch (e) {
        logger.error("error in listen", e);
      }
      yield;
    }
  }
}
