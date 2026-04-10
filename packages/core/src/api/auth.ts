import axios from 'axios'
import { koobooContext } from '../config/context.js'
import { urlJoin } from '../utils/url.js'

export interface LoginParams {
  username: string
  password: string
}

/**
 * 通过站点url进行登录
 */
export async function loginBySite(
  siteUrl: string,
  params: LoginParams
): Promise<string> {
  const response = await axios.post(urlJoin(siteUrl, '/_api/v2/user/login'), {
    ...params,
    withToken: true
  })
  const token = response.headers.access_token
  // 设置上下文
  koobooContext.init({
    ...koobooContext.getConfig(),
    username: params.username,
    password: params.password,
    token,
    siteUrl
  })
  return token
}

/**
 * 通过服务器url进行登录
 */
export async function loginByServer(
  serverUrl: string,
  params: LoginParams
): Promise<string> {
  const response = await axios.post(urlJoin(serverUrl, '/_api/v2/user/login'), {
    ...params,
    withToken: true
  })
  const token = response.headers.access_token

  // 设置上下文
  koobooContext.init({
    ...koobooContext.getConfig(),
    username: params.username,
    password: params.password,
    token,
    serverUrl
  })
  return token
}

/**
 * 通过默认服务器进行登入并返回指定服务器
 */
export async function loginByServerAndGetServerUrl(params: LoginParams) {
  const { data } = await axios.get<{
    token: string
    serverUrl: string
  }>('https://kooboo.cn/_api/v2/cli/GenerateToken', {
    params
  })

  // 更新上下文
  koobooContext.init({
    ...koobooContext.getConfig(),
    username: params.username,
    password: params.password,
    token: data.token,
    serverUrl: data.serverUrl
  })

  return data
}
