/*
 * @Author: Kabuda-czh
 * @Date: 2023-04-19 13:47:26
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-04-19 18:23:38
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\valorant\auth.tsx
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
import type { Session } from 'koishi'
import { type Quester, Time } from 'koishi'
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

  constructor(http: Quester) {
    this._http = http
    this._headers = {
      'User-Agent': Auth.RIOT_CLIENT_USER_AGENT,
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*',
    }
    this.user_agent = Auth.RIOT_CLIENT_USER_AGENT
  }

  static _extract_tokens(data: Record<string, any>) {
    const pattern = /access_token=([^&]*)|id_token=([^&]*)|expires_in=([^&]*)/ig
    const match = data?.response?.parameters?.uri?.match(pattern)
    return {
      access_token: match && match[0] && match[0].split('=')[1] as string,
      id_token: match && match[1] && match[1].split('=')[1] as string,
      expires_in: match && match[2] && match[2].split('=')[1] as string,
    }
  }

  static _extract_tokens_from_url(session: Session, url: string): string[] {
    try {
      const access_token = url.split('access_token=')[1].split('&scope')[0]
      const id_token = url.split('id_token=')[1].split('&')[0]
      return [access_token, id_token]
    }
    catch (err) {
      throw new Error(session.text('invalid_cookie'))
    }
  }

  async authenticate(session: Session, username: string, password: string): Promise<Record<string, any>> {
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

        // 设置令牌到期时间
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
          throw new Error(<i18n path=".errors.auth.ratelimit" />)

        const method = data?.multifactor?.method
        if (method === 'email') {
          // 开启了二步验证码, 返回必要的数据
          return {
            auth: '2fa',
            cookie: cookies.join(';'),
            label: session.text('.errors.auth.input_2fa_code'),
            message: session.text('.errors.auth.input_2fa_email', data.multifactor),
          }
        }
        else { throw new Error(<i18n path=".errors.auth.temp_login_not_suppport_2fa" />) }
      }
      else { throw new Error(<i18n path="errors.auth.invalid_password" />) }
    })
  }

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

  async getRegion(accessToken: string, idToken: string): Promise<string> {
    // 准备对应请求头
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }

    // 准备请求体
    const data = { id_token: idToken }

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

  async get2faCode(session: Session, code: string, cookies: string): Promise<Record<string, any>> {
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
    }).then((res) => {
      const { data } = res
      if (data.type === 'response') {
        const cookies = []
        res.headers['set-cookie'].forEach((cookie: string) => {
          cookies.push(cookie.split(';')[0])
        })
        const uri = data?.response?.parameters?.uri
        const [access_token, id_token] = Auth._extract_tokens_from_url(session, uri)
        return {
          auth: 'response',
          data: {
            cookie: cookies.join(';'),
            access_token,
            id_token,
          },
        }
      }
    }).catch(() => {
      return {
        auth: 'failed',
        error: <i18n path=".errors.auth.2fa_invalid_code" />,
      }
    })
  }
}
