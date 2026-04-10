import { CodeItem } from './code.js'
import { LayoutItem } from './layout.js'
import { PageItem } from './page.js'
import { ViewItem } from './view.js'
import { StyleItem } from './style.js'
import { ScriptItem } from './script.js'
import { ResourceType } from './resource.js'

export interface AuthConfig {
  username?: string
  password?: string
  token?: string
  serverUrl?: string
  siteUrl?: string
  siteId?: string
}

export type ResourceMetadataItem = {
  id: string
  version: number
  name: string
}

export type ResourceMetadata = {
  [K in ResourceType]: Record<string, ResourceMetadataItem>
}

export type ModuleResourceMetadata = Record<
  string,
  { id: string; name: string }
>
