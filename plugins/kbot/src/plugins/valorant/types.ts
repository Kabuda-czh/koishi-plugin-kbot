/*
 * @Author: Kabuda-czh
 * @Date: 2023-04-19 17:43:19
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-05-23 10:34:37
 * @FilePath: \KBot-App\plugins\kbot\src\plugins\valorant\types.ts
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Valorant {
  export interface UserInfoResponse {
    country: string
    sub: string
    email_verified: boolean
    player_plocale?: any
    country_at: number
    pw: Pw
    phone_number_verified: boolean
    account_verified: boolean
    ppid?: any
    player_locale: string
    acct: Acct
    age: number
    jti: string
    affinity: Affinity
  }

  export interface AuthorizationResponse {
    type: 'response'
    response: Response
    country: string
  }

  export interface AuthorizationMultifactorResponse {
    type: 'multifactor'
    multifactor: Multifactor
    country: string
    securityProfile: string
  }

  export interface EntitlementsResponse {
    entitlements_token: string
  }

  export interface RegionResponse {
    token: string
    affinities: Affinities
  }
}

interface Response {
  mode: string
  parameters: Parameters
}

interface Multifactor {
  email: string
  method: string
  methods: string[]
  multiFactorCodeLength: number
  mfaVersion: string
}

interface Parameters {
  uri: string
}

interface Affinity {
  pp: string
}

interface Acct {
  type: number
  state: string
  adm: boolean
  game_name: string
  tag_line: string
  created_at: number
}

interface Pw {
  cng_at: number
  reset: boolean
  must_reset: boolean
}

interface Affinities {
  pbe: string
  live: string
}
