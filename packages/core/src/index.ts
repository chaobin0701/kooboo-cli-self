import { koobooContext } from './config/context.js'
import { createSiteClient, createServerClient } from './http/client.js'
import * as authApi from './api/auth.js'
import * as labelApi from './api/label.js'
import * as siteApi from './api/site.js'
import * as resourceApi from './api/resource/index.js'
import { AuthConfig } from './types/context.js'

export * from './types/index.js'

/**
 * 初始化上下文，可以选择性传入配置
 */
export function init(config: AuthConfig): void {
  koobooContext.init(config)

  // 初始化客户端
  const currentConfig = koobooContext.getConfig()

  if (currentConfig.serverUrl) {
    createServerClient()
  }

  if (currentConfig.siteUrl) {
    createSiteClient()
  }
}

/**
 * 获取当前上下文配置
 */
export function getConfig(): AuthConfig {
  return koobooContext.getConfig()
}

/**
 * 更新上下文配置
 */
export function updateConfig(updates: Partial<AuthConfig>): void {
  const currentConfig = koobooContext.getConfig()
  koobooContext.init({
    ...currentConfig,
    ...updates
  })
}

/**
 * 更新token
 */
// export function updateToken(
//   token: string,
//   updateEnvFile: boolean = false
// ): void {
//   koobooContext.updateToken(token, updateEnvFile)
// }

// 导出API
export const auth = authApi
export const label = labelApi
export const site = siteApi
export const resource = resourceApi
// 导出类型
// export * from './types'
export { ClientType } from './http/client.js'
