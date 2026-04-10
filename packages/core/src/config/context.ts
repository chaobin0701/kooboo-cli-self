import { AxiosInstance } from 'axios'
import { ClientType } from '../http/client.js'
import {
  AuthConfig,
  ResourceMetadata,
  ModuleResourceMetadata
} from '../types/context.js'

export class KoobooContext {
  private static instance: KoobooContext
  public authConfig: AuthConfig = {}
  public resourceMetadata: ResourceMetadata = {
    api: {},
    page: {},
    view: {},
    layout: {},
    codeblock: {},
    pagescript: {},
    style: {},
    script: {}
  }
  public moduleResourceMetadata: ModuleResourceMetadata = {}

  private httpClients: Record<ClientType, AxiosInstance | undefined> = {
    [ClientType.SITE]: undefined,
    [ClientType.SERVER]: undefined
  }
  private useEnvFile: boolean = true

  private constructor() {}

  public static hasInstance(): boolean {
    return !!KoobooContext.instance
  }

  public static getInstance(): KoobooContext {
    if (!KoobooContext.hasInstance()) {
      KoobooContext.instance = new KoobooContext()
    }
    return KoobooContext.instance
  }

  // 初始化
  public init(config: AuthConfig): void {
    this.authConfig = config
  }

  // 更新token
  public updateToken(token: string): void {
    this.authConfig.token = token
  }

  // 获取当前配置
  public getConfig(): AuthConfig
  public getConfig(key?: keyof AuthConfig): AuthConfig | any {
    if (key) {
      return this.authConfig[key]
    }
    return this.authConfig
  }
  // 设置配置
  public setConfig(config: AuthConfig): void
  public setConfig(config: keyof AuthConfig, value: string): void
  public setConfig(
    config: AuthConfig | keyof AuthConfig,
    value?: string
  ): void {
    if (typeof config === 'string') {
      this.authConfig[config] = value
    } else {
      Object.entries(config).forEach(([key, val]) => {
        this.authConfig[key as keyof AuthConfig] = val as string
      })
    }
  }

  // 设置HTTP客户端
  public setHttpClient(type: ClientType, client: AxiosInstance): void {
    this.httpClients[type] = client
  }

  // 获取HTTP客户端
  public getHttpClient(type: ClientType): AxiosInstance | undefined {
    return this.httpClients[type]
  }
}

export const koobooContext = KoobooContext.getInstance()
