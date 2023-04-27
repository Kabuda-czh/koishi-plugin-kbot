/*
 * @Author: Kabuda-czh
 * @Date: 2023-04-19 13:47:26
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-04-26 17:52:19
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\valorant\auth.tsx
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import https from 'node:https'
import { Time } from 'koishi'
import type { Quester } from 'koishi'
import { ValorantApi } from './enum'
import type { Valorant } from './types'

const FORCED_CIPHERS = [
  'ECDHE-ECDSA-AES256-GCM-SHA384',
  'ECDHE-ECDSA-AES128-GCM-SHA256',
  'ECDHE-ECDSA-CHACHA20-POLY1305',
  'ECDHE-RSA-AES128-GCM-SHA256',
  'ECDHE-RSA-CHACHA20-POLY1305',
  'ECDHE-RSA-AES128-SHA256',
  'ECDHE-RSA-AES128-SHA',
  'ECDHE-RSA-AES256-SHA',
  'ECDHE-ECDSA-AES128-SHA256',
  'ECDHE-ECDSA-AES128-SHA',
  'ECDHE-ECDSA-AES256-SHA',
  'ECDHE+AES128',
  'ECDHE+AES256',
  'ECDHE+3DES',
  'RSA+AES128',
  'RSA+AES256',
  'RSA+3DES',
]

const agent = new https.Agent({
  rejectUnauthorized: true,
  minVersion: 'TLSv1.3',
  ciphers: FORCED_CIPHERS.join(':'),
})

export default class Auth {
  // 默认 UA
  private static readonly RIOT_CLIENT_USER_AGENT: string = 'RiotClient/60.0.6.4770705.4749685 rso-auth (Windows;10;;Professional, x64)'

  private _http: Quester
  private _headers: Record<string, string> = {}
  private user_agent: string

  // 初始化
  constructor(http: Quester) {
    this._http = http
    this._headers = {
      'User-Agent': Auth.RIOT_CLIENT_USER_AGENT,
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*',
    }
    this.user_agent = Auth.RIOT_CLIENT_USER_AGENT
  }

  // 静态解析 token
  static _extract_tokens(data: Record<string, any>) {
    const pattern = /access_token=([^&]*)|id_token=([^&]*)|expires_in=([^&]*)/ig
    const match = data?.response?.parameters?.uri?.match(pattern)
    return {
      access_token: match && match[0] && match[0].split('=')[1] as string,
      id_token: match && match[1] && match[1].split('=')[1] as string,
      expires_in: match && match[2] && match[2].split('=')[1] as string,
    }
  }

  // 静态解析 token
  static _extract_tokens_from_url(url: string): string[] {
    try {
      const access_token = url.split('access_token=')[1].split('&scope')[0]
      const id_token = url.split('id_token=')[1].split('&')[0]
      return [access_token, id_token]
    }
    catch (err) {
      throw new Error(<i18n path=".errors.auth.invalid_cookie" />)
    }
  }

  /**
   * 用于认证用户的函数
   * @param username 要认证的用户名
   * @param password 要认证的密码
   * @returns 如果认证成功, 则返回包含认证数据的字典, 包括 cookie, 访问令牌和令牌 ID.
   *          如果认证需要 2FA, 则此函数返回一个包含 cookie 数据和提示用户输入 2FA 代码的消息的字典.
   *          否则, 此函数返回 null.
   */
  async authenticate(username: string, password: string): Promise<Record<string, any>> {
    let cookies = []

    // 初始授权参数
    const data = {
      client_id: 'play-valorant-web-prod',
      nonce: '1',
      redirect_uri: 'https://playvalorant.com/opt_in',
      response_type: 'token id_token',
      scope: 'account openid',
    }

    // 发送初始授权请求
    await this._http.axios(ValorantApi.Authorization, {
      method: 'POST',
      data,
      headers: this._headers,
      httpsAgent: agent,
    }).then((res) => {
      // 准备授权请求的 cookies
      res.headers['set-cookie'].forEach((cookie: string) => {
        cookies.push(cookie.split(';')[0])
      })
    })

    // 发送登录请求
    const userData = {
      type: 'auth',
      username,
      password,
      remember: true,
    }

    // 发送身份认证请求
    return await this._http.axios<Valorant.AuthorizationResponse | Valorant.AuthorizationMultifactorResponse>(ValorantApi.Authorization, {
      method: 'PUT',
      data: userData,
      headers: {
        ...this._headers,
        Cookie: cookies.join(';'),
      },
      httpsAgent: agent,
    }).then((res) => {
      cookies = []
      res.headers['set-cookie'].forEach((cookie: string) => {
        cookies.push(cookie.split(';')[0])
      })

      // 处理身份验证响应
      const { data } = res
      if (data.type === 'response') {
        const { access_token, id_token } = Auth._extract_tokens(data)

        // TODO: 设置令牌到期时间
        const expiry_token = new Date().getTime() + Time.hour
        cookies.push(`expiry_token=${expiry_token}`)

        // 返回认证数据
        return {
          auth: 'response',
          data: {
            cookie: cookies.join(';'),
            access_token,
            id_token,
          },
        }
      }
      else if (data.type === 'multifactor') {
        if (res.status === 429)
          // 请求次数过多
          throw new Error(<i18n path=".errors.auth.ratelimit" />)

        const method = data?.multifactor?.method
        if (method === 'email') {
          // 开启了二步验证码, 返回必要的数据
          return {
            auth: '2fa',
            cookie: cookies.join(';'),
            label: <i18n path=".errors.auth.input_2fa_code" />,
            message: <i18n path=".errors.auth.2fa_to_email">{ [data.multifactor] }</i18n>,
          }
        }
        // 不支持的 2FA 方法
        else { throw new Error(<i18n path=".errors.auth.temp_login_not_suppport_2fa" />) }
      }
      // 账号密码错误
      else { throw new Error(<i18n path="errors.auth.invalid_password" />) }
    })
  }

  /**
   *
   * @param accessToken 访问令牌
   * @returns 返回对应的 jwt token
   */
  async getEntitlementsToken(accessToken: string): Promise<string> {
    // 准备对应请求头
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }

    return await this._http.axios<Valorant.EntitlementsResponse>(ValorantApi.Entitlements, {
      method: 'POST',
      headers,
      httpsAgent: agent,
    }).then((res) => {
      // 提取令牌
      const { data } = res
      return data?.entitlements_token
    }).catch(() => {
      throw new Error(<i18n path=".errors.auth.cookies_expired" />)
    })
  }

  /**
   * 用于获取用户信息的方法
   * @param accessToken 访问令牌
   * @returns 返回包含 puuid, name, tag 的数组
   */
  async getUserInfo(accessToken: string): Promise<string[]> {
    // 准备对应请求头
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }

    return await this._http.axios<Valorant.UserInfoResponse>(ValorantApi.Userinfo, {
      method: 'POST',
      headers,
      httpsAgent: agent,
    }).then((res) => {
      // 提取用户信息
      const { data } = res
      const puuid = data?.sub
      const name = data?.acct?.game_name
      const tag = data?.acct?.tag_line
      return [puuid, name, tag]
    }).catch(() => {
      throw new Error('无法从响应中提取所需的用户信息')
    })
  }

  /**
   * 用于获取区域的方法
   * @param accessToken 访问令牌
   * @param idToken 令牌 ID
   * @returns 区域的字符串
   */
  async getRegion(accessToken: string, idToken: string): Promise<string> {
    // 准备对应请求头
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }

    // 准备请求体
    const data = { id_token: idToken }

    // 发送区域请求
    return await this._http.axios<Valorant.RegionResponse>(ValorantApi.Region, {
      method: 'PUT',
      headers,
      data,
      httpsAgent: agent,
    }).then((res) => {
      // 提取区域信息
      const { data } = res
      const region = data?.affinities?.live
      return region
    }).catch(() => {
      throw new Error('无法从响应中提取所需的区域信息')
    })
  }

  /**
   * 用于输入 2fa 验证码的方法
   * @param code 2fa 验证码
   * @param cookies cookie 字符串
   * @returns 身份信息的对象
   */
  async get2faCode(code: string, cookies: string): Promise<Record<string, any>> {
    // 准备请求体
    const data = { type: 'multifactor', code, rememberDevice: true }

    // 发送输入 2FA 验证码请求
    return await this._http.axios(ValorantApi.Authorization, {
      method: 'PUT',
      headers: {
        ...this._headers,
        Cookie: cookies,
      },
      data,
      httpsAgent: agent,
    }).then((res) => {
      const { data } = res
      // 如果成功输入 2FA 验证码，则返回包含身份验证信息的字典
      if (data.type === 'response') {
        const cookies = []
        res.headers['set-cookie'].forEach((cookie: string) => {
          cookies.push(cookie.split(';')[0])
        })
        const uri = data?.response?.parameters?.uri
        const [access_token, id_token] = Auth._extract_tokens_from_url(uri)
        return {
          auth: 'response',
          data: {
            cookie: cookies.join(';'),
            access_token,
            id_token,
          },
        }
      }
      // 超时判断/无效
      else {
        return {
          auth: 'failed',
          error: <i18n path=".errors.auth.2fa_invalid_code" />,
        }
      }
    }).catch(() => {
      return {
        auth: 'failed',
        error: <i18n path=".errors.auth.2fa_invalid_code" />,
      }
    })
  }

  /**
   * 用于兑换新的 cookie 的方法
   * @param cookies cookie 字符串
   * @returns 数组，包含兑换后的 cookie 和 access_token 和 entitlements_token
   */
  async redeemCookies(cookies: string) {
    // 准备请求 params
    const params = {
      redirect_uri: 'https://playvalorant.com/Fopt_in',
      client_id: 'play-valorant-web-prod',
      response_type: 'token id_token',
      scope: 'account openid',
      nonce: '1',
    }

    return await this._http.axios(ValorantApi.Authorize, {
      method: 'GET',
      params,
      headers: {
        Cookie: cookies,
      },
      httpsAgent: agent,
      maxRedirects: 0,
    }).then(async (res) => {
      if (res.status !== 303)
        throw new Error(<i18n path=".errors.auth.cookies_expired" />)

      if (res.headers.Location.startsWith('/login'))
        throw new Error(<i18n path=".errors.auth.cookies_expired" />)

      const newCookies = []
      res.headers['set-cookie'].forEach((cookie: string) => {
        newCookies.push(cookie.split(';')[0])
      })

      const [accessToken, _idToken] = Auth._extract_tokens_from_url(res.data)
      const entitlementsToken = await this.getEntitlementsToken(accessToken)

      return [newCookies.join(';'), accessToken, entitlementsToken]
    })
  }

  /**
   * 临时登录, 返回用户信息
   * @param username 用户名
   * @param password 密码
   * @returns 返回玩家信息对象, 包含 puuid, playerName, region, headers
   */
  async tempAuth(username: string, password: string) {
    const authenticate = await this.authenticate(username, password)
    if (authenticate.auth === 'response') {
      const { accessToken, idToken } = authenticate.data
      const entitlementsToken = await this.getEntitlementsToken(accessToken)
      const [puuid, name, tag] = await this.getUserInfo(accessToken)
      const region = await this.getRegion(accessToken, idToken)

      const playerName = name ? `${name}#${tag}` : 'no_username'
      const headers = {
        'Content-Type': 'application/json',
        'X-Riot-Entitlements-JWT': entitlementsToken,
        'Authorization': `Bearer ${accessToken}`,
      }

      return {
        puuid,
        playerName,
        region,
        headers,
      }
    }

    throw new Error(<i18n path=".errors.auth.temp_login_not_suppport_2fa" />)
  }

  /**
   * 使用 cookie 登录并返回包含访问令牌, 令牌 ID 和资格令牌的字典
   * @param cookies cookie 字符串
   * @returns 包含访问令牌, 令牌 ID, 资格令牌和 cookie 等字段的对象
   */
  async loginWithCookies(cookies: string) {
    const cookiePayload = cookies.startsWith('e') ? `ssid=${cookies}` : cookies

    this._headers.Cookie = cookiePayload

    // 准备请求 params
    const params = {
      redirect_uri: 'https://playvalorant.com/Fopt_in',
      client_id: 'play-valorant-web-prod',
      response_type: 'token id_token',
      scope: 'account openid',
      nonce: '1',
    }

    // 发送请求
    return await this._http.axios(ValorantApi.Authorize, {
      method: 'GET',
      params,
      headers: this._headers,
      httpsAgent: agent,
      maxRedirects: 0,
    }).then(async (res) => {
      if (res.status !== 303)
        throw new Error(<i18n path=".errors.auth.cookies_expired" />)
      const newCookies = []
      res.headers['set-cookie'].forEach((cookie: string) => {
        newCookies.push(cookie.split(';')[0])
      })

      const [accessToken, idToken] = Auth._extract_tokens_from_url(res.data)
      const entitlementsToken = await this.getEntitlementsToken(accessToken)

      return {
        cookies: newCookies.join(';'),
        accessToken,
        idToken,

      }
    }).finally(() => {
      delete this._headers.Cookie
    })
  }

  /**
   * 刷新 cookie
   * @param refreshToken 需要刷新的 refresh_token
   * @returns 数组，包含兑换后的 cookie 和 access_token 和 entitlements_token
   */
  async refreshToken(refreshToken: string) {
    return await this.redeemCookies(refreshToken)
  }
}
