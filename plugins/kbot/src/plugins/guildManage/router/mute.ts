import { Context } from "koishi"
import { IRouterStrategy } from "../typings"
import handleFunction from "../utils"

export const muteRoutes: IRouterStrategy = {
  "/muteGuild": function (context: Context) {
    return handleFunction(context, "muteChannel", "guildId", "", "mute")
  },
  "/muteMember": function (context: Context) {
    return handleFunction(context, "muteGuildMember", "guildId", "userId", "duration")
  },
}