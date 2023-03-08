import type { Context } from 'koishi'
import type { Context as KoaContext } from 'koa'

export interface UserInfo {
  userId: string
  username: string
  avatar?: string
}

export interface GuildMemberInfo extends UserInfo {
  nickname: string
}

export interface IRouterStrategy {
  [key: string]: (context: Context) => (ctx: KoaContext) => Promise<void>
}
