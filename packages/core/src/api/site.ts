import { koobooContext } from '../config/context.js'
import { getClient, ClientType } from '../http/client.js'

export interface ReteSettings {
  permitLimit: number
  withinSeconds: number
}

export interface UnocssSettings {
  enable: boolean
  disableSsr: boolean
  config: string
  resetStyle: boolean
}

export interface TinymceSettings {
  toolbar?: string
  font_size_formats?: string
  font_formats?: string
  [name: string]: any
}

export interface Site {
  autoDetectCulture: boolean
  codeLogSettings: { enable: boolean; keepDays: number; logLevel: string }
  sitemapSettings: {
    enable: boolean
    path: string
    autoGenerate: boolean
    code: string
  }
  rateLimitSettings: {
    enable: boolean
    limitAllRequest: boolean
    allRequestRateSettings: ReteSettings
    ipLimits: Record<string, ReteSettings>
    userAgentLimits: Record<string, ReteSettings>
  }
  accessLimitSettings: {
    enable: boolean
    ipBlacklist: string[]
    blockUserAgentKeywords: string[]
  }
  unocssSettings: UnocssSettings
  name: string
  displayName: string
  siteType: string
  previewUrl: string
  baseUrl: string
  defaultDatabase: string
  id: string
  customSettings: Record<string, string>
  enableCORS: boolean
  enableCache: boolean
  enableCluster: boolean
  enableConstraintChecker: boolean
  enableConstraintFixOnSave: boolean
  enableDiskSync: boolean
  enableFileIOUrl: boolean
  enableFrontEvents: boolean
  enableBackendEvents: boolean
  enableFullTextSearch: boolean
  enableImageBrowserCache: boolean
  enableImageLog: boolean
  enableJsCssBrowerCache: boolean
  enableJsCssCompress: boolean
  enableHtmlMinifier: boolean
  enableImageAlt: boolean
  enableCssSplitByMedia: boolean
  mobileMaxWidth: string
  desktopMinWidth: string
  enableLighthouseOptimization: boolean
  enableMultilingual: boolean
  enableSPA: boolean
  enableSitePath: boolean
  enableSqlLog: boolean
  enableSystemRoute: boolean
  enableVideoBrowserCache: boolean
  enableVisitorLog: boolean
  enableTinymceToolbarSettings: boolean
  forceSSL: boolean
  imageCacheDays: number
  lighthouseSettingsJson: string
  pwa: { enable: boolean; manifest: string; serviceWorker: string }
  sitePath: Record<string, string>
  culture: Record<string, string>
  defaultCulture: string
  diskSyncFolder: string
  prUrl: string
  published: boolean
  visibleAdvancedMenus: string[] | null
  devPassword: string
  status: 'Published' | 'Development' | 'Auditing' | 'Forbidden'
  tinymceToolbarSettings: string // obsolete
  tinymceSettings: TinymceSettings
  includePath: boolean
  specialPath: string[] | undefined
  ssoLogin: boolean
  codeSuggestions: string[]
  recordSiteLogVideo: boolean
  enableUpdateSimilarPage: boolean
  automateCovertImageToWebp: boolean
  continueDownload?: boolean
  enableVisitorCountryRestriction?: boolean
  visitorCountryRestrictions?: Record<string, string>
  visitorCountryRestrictionPage?: string
  enableResourceCache: boolean
  resourceCaches: number
  contentFoldersSequence: string[]
}

export async function createSite(siteName: string) {
  const client = getClient(ClientType.SERVER)
  const { data } = await client.post<{
    id: string
    siteUrl: string
  }>('_api/v2/cli/CreateSite', {
    name: siteName
  })
  koobooContext.setConfig({
    siteId: data.id,
    siteUrl: data.siteUrl
  })

  return data
}

export async function getSite() {
  const client = getClient(ClientType.SITE)
  const {
    data: { site }
  } = await client.get<{ site: Site }>('/Site/Get')
  return site
}

export async function updateSite(site: Partial<Site>) {
  const client = getClient(ClientType.SITE)
  await client.post('/Site/post', site)
}

export async function getTypes() {
  const client = getClient(ClientType.SITE)
  const { data } = await client.get<string>('/KScript/GetDefine', {
    headers: {
      'Content-Type': 'text/plain'
    }
  })
  return data
}

export function getSiteClient() {
  return getClient(ClientType.SITE)
}
