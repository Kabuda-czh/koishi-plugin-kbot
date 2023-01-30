/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:28:53
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-01-30 15:00:19
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\youtube\index.tsx
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import { Context, Logger, Schema } from "koishi";
import {} from 'koishi-plugin-puppeteer'

interface ApiData {
  kind: string;
  etag: string;
  items: Item[];
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

interface ImageSize {
  url: string;
  width: number;
  height: number;
}

interface Thumbnails {
  default: ImageSize;
  medium: ImageSize;
  high: ImageSize;
}

interface Item {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: Thumbnails;
    channelTitle: string;
    tags: string[];
    categoryId: string;
    liveBroadcastContent: string;
    localized: {
      title: string;
      description: string;
    };
  };
  contentDetails: {
    duration: string;
    dimension: string;
    definition: string;
    caption: string;
    licensedContent: boolean;
    contentRating: any;
    projection: string;
  };
  status: {
    uploadStatus: string;
    privacyStatus: string;
    license: string;
    embeddable: boolean;
    publicStatsViewable: boolean;
    madeForKids: boolean;
  };
  statistics: {
    viewCount: string;
    likeCount: string;
    favoriteCount: string;
    commentCount: string;
  };
}

export interface Config {
  youtubeDataApiKey: string;
}

const logger = new Logger('plugins/youtube')

export const Config: Schema<Config> = Schema.object({
  youtubeDataApiKey: Schema.string()
    .required()
    .description(
      "请提供YouTube Data API v3, 详情: https://developers.google.com/youtube/v3/getting-started"
    ),
});

const apiEndPointPrefix = "https://www.googleapis.com/youtube/v3/videos";

const videoRegex =
  /^(?:https?:\/\/)?(?:i\.|www\.|img\.)?(?:youtu\.be\/|youtube\.com\/|ytimg\.com\/)(?:embed\/|v\/|vi\/|vi_webp\/|watch\?v=|watch\?.+&v=)?((\w|-){11})(?:\S+)?$/;

const fetchDataFromAPI = async (
  ctx: Context,
  config: Config,
  videoId: string
): Promise<ApiData> => {
  return await ctx.http.get(
    `${apiEndPointPrefix}?id=${videoId}&key=${config.youtubeDataApiKey}&part=snippet,contentDetails,statistics,status`
  );
};

const getIDFromURLByRegex = (url: string): string | undefined => {
  const [, id] = url.match(videoRegex) || [];
  return id;
};

export function apply(ctx: Context, config: Config) {
  ctx.middleware(async (session, next) => {
    const isYoutube =
      session.content.includes("youtube.com") ||
      session.content.includes("https://youtu.be");
    if (!isYoutube) return next();

    try {
      let id,
        tagString = "无";

      if (session.content.includes("https://youtu.be")) {
        const index = session.content.lastIndexOf("/");
        id = session.content.substring(index + 1, session.content.length);
      } else {
        id = getIDFromURLByRegex(session.content);
      }

      const result = await fetchDataFromAPI(ctx, config, id);

      const { snippet: {
        title,
        description,
        channelTitle,
        thumbnails: {
          medium: { url }
        },
        publishedAt,
        tags
      }, statistics } = result.items[0];

      if (tags) tagString = tags.length > 1 ? tags.join(", ") : tags[0];

      // TODO 待优化样式
      await session.send(
        <html style={{
          padding: '1rem',
          color: '#fff',
          background: '#000'
        }}>
          <p>Youtube视频内容解析</p>
          <br />
          <img src={url} />
          <p>频道: {channelTitle}</p>
          <p>标题: {title}</p>
          <p>描述: {description.length > 50 ? description.slice(0, 50) + '...' : description}</p>
          <p>发布时间: {publishedAt}</p>
          <p>标签: {tagString}</p>
          <p>播放量: {statistics.viewCount}</p>
          <p>点赞: {statistics.likeCount}</p>
        </html>
      )

    } catch (error) {
      logger.error(error);
      return "Youtube视频解析发生错误";
    }
    return next();
  });
}
