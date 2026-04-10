// packages/core/http/client.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { setupInterceptors } from './interceptors.js'
import { koobooContext } from '../config/context.js'
import { urlJoin } from '../utils/url.js'

// 客户端类型
export enum ClientType {
  SITE = 'site',
  SERVER = 'server'
}

// 创建站点客户端
export function createSiteClient(): AxiosInstance {
  const config = koobooContext.getConfig()

  if (!config.siteUrl) {
    throw new Error('Site URL is required to create site client')
  }

  const client = axios.create({
    baseURL: urlJoin(config.siteUrl, '/_api/v2'),
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  setupInterceptors(client)
  koobooContext.setHttpClient(ClientType.SITE, client)

  return client
}

// 创建服务器客户端
export function createServerClient(): AxiosInstance {
  const config = koobooContext.getConfig()

  if (!config.serverUrl) {
    throw new Error('Server URL is required to create server client')
  }

  const client = axios.create({
    baseURL: urlJoin(config.serverUrl, '/_api/v2'),
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  setupInterceptors(client)
  koobooContext.setHttpClient(ClientType.SERVER, client)

  return client
}

// 获取特定类型的客户端
export function getClient(type: ClientType = ClientType.SITE): AxiosInstance {
  let client = koobooContext.getHttpClient(type)

  if (!client) {
    client =
      type === ClientType.SITE ? createSiteClient() : createServerClient()
  }

  return client
}
