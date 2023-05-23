/*
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:28:53
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-05-23 10:35:34
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\youtube\index.tsx
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import type { Context } from 'koishi'
import { Logger, Schema } from 'koishi'
import { } from 'koishi-plugin-puppeteer'

interface ApiData {
  kind: string
  etag: string
  items: Item[]
  pageInfo: {
    totalResults: number
    resultsPerPage: number
  }
}

interface ImageSize {
  url: string
  width: number
  height: number
}

interface Thumbnails {
  default: ImageSize
  medium: ImageSize
  high: ImageSize
}

interface Item {
  kind: string
  etag: string
  id: string
  snippet: {
    publishedAt: string
    channelId: string
    title: string
    description: string
    thumbnails: Thumbnails
    channelTitle: string
    tags: string[]
    categoryId: string
    liveBroadcastContent: string
    localized: {
      title: string
      description: string
    }
  }
  contentDetails: {
    duration: string
    dimension: string
    definition: string
    caption: string
    licensedContent: boolean
    contentRating: any
    projection: string
  }
  status: {
    uploadStatus: string
    privacyStatus: string
    license: string
    embeddable: boolean
    publicStatsViewable: boolean
    madeForKids: boolean
  }
  statistics: {
    viewCount: string
    likeCount: string
    favoriteCount: string
    commentCount: string
  }
}

export interface IConfig {
  youtubeDataApiKey: string
  useImage?: boolean
}

const logger = new Logger('plugins/youtube')

export const Config: Schema<IConfig> = Schema.object({
  youtubeDataApiKey: Schema.string()
    .required()
    .description(
      '请提供YouTube Data API v3 (必填) 详情: https://developers.google.com/youtube/v3/getting-started',
    ),
  useImage: Schema.boolean().default(false).description('是否使用图片模式 (需要 puppeteer 支持!)'),
})

const apiEndPointPrefix = 'https://www.googleapis.com/youtube/v3/videos'

const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?(?=.*v=\w+)(?:\S+)?|embed\/\w+|\S+)|youtu\.be\/\w+)(?:\S+)?/ig

const videoRegex
  = /^(?:https?:\/\/)?(?:i\.|www\.|img\.)?(?:youtu\.be\/|youtube\.com\/|ytimg\.com\/)(?:embed\/|v\/|vi\/|vi_webp\/|watch\?v=|watch\?.+&v=)?((\w|-){11})(?:\S+)?$/

async function fetchDataFromAPI(
  ctx: Context,
  config: IConfig,
  videoId: string,
): Promise<ApiData> {
  try {
    const data = await ctx.http.get(
      `${apiEndPointPrefix}?id=${videoId}&key=${config.youtubeDataApiKey}&part=snippet,contentDetails,statistics,status`,
    )
    return data
  }
  catch (error) {
    logger.error(`YouTube API 请求失败: ${error}`)
    throw new Error('YouTube API 请求失败')
  }
}

function getIDFromURLByRegex(url: string): string | undefined {
  const [, id] = url.match(videoRegex) || []
  return id
}

export function apply(ctx: Context, config: IConfig) {
  ctx.middleware(async (session, next) => {
    const contentArray = session.content.match(youtubeRegex)
    const isYoutube = contentArray && contentArray.length > 0
    if (!isYoutube)
      return next()

    try {
      contentArray.map(async (content) => {
        logger.info(`捕获到 Youtube 视频链接: ${content}`)

        let id: string | undefined
        let tagString = '无'

        if (content.includes('https://youtu.be')) {
          const index = content.lastIndexOf('/')
          id = content.substring(index + 1, content.length)
        }
        else {
          id = getIDFromURLByRegex(content)
        }

        const result = await fetchDataFromAPI(ctx, config, id)

        if (result.items.length === 0)
          return '未能成功解析, 或许视频不存在'

        const {
          snippet: {
            title,
            description,
            channelTitle,
            thumbnails: {
              medium: { url },
            },
            publishedAt,
            tags,
          }, statistics,
        } = result.items[0]

        if (tags)
          tagString = tags.length > 1 ? tags.join(', ') : tags[0]

        logger.info(`Youtube视频解析成功: ${title}`)

        if (ctx.puppeteer && config.useImage) {
        // TODO 待优化样式
          await session.send(
          <html style={{
            padding: '1rem',
            color: '#fff',
            background: '#000',
            fontSize: '14px',
            lineHeight: '1.5',
            fontFamily: 'sans-serif',
            fontWeight: 'normal',
          }}>
            <img src={url} />
            <p>频道: {channelTitle}</p>
            <p>标题: {title}</p>
            <p>描述: {description.length > 50 ? `${description.slice(0, 50)}...` : description}</p>
            <p>发布时间: {publishedAt}</p>
            <p>标签: {tagString}</p>
            <p>播放量: {statistics.viewCount}</p>
            <p>点赞: {statistics.likeCount}</p>
          </html>,
          )
        }
        else {
          await session.send(`<image url="${url}" />
频道: ${channelTitle}
标题: ${title}
描述: ${description.length > 50 ? `${description.slice(0, 50)}...` : description}
发布时间: ${publishedAt}
标签: ${tagString}
播放量: ${statistics.viewCount}
点赞: ${statistics.likeCount}
`)
        }
      })
    }
    catch (error) {
      logger.error(error)
      return 'Youtube视频解析发生错误'
    }
    return next()
  })
}
