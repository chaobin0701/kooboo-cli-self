import fse from 'fs-extra'
import path from 'node:path'
import { getConfig } from './config.js'

export type SiteConfigJson = Record<string, any> & {
  id?: string
  baseUrl?: string
  siteUrl?: string
}

export function getSiteConfigPath(projectPath = process.cwd()) {
  return path.join(projectPath, '.kooboo-cli', 'siteConfig.json')
}

export function readSiteConfig(projectPath = process.cwd()): SiteConfigJson | null {
  const siteConfigPath = getSiteConfigPath(projectPath)
  const config = fse.readJSONSync(siteConfigPath, { throws: false })
  return config || null
}

export function writeSiteConfig(siteConfig: SiteConfigJson, projectPath = process.cwd()) {
  const siteConfigPath = getSiteConfigPath(projectPath)
  fse.outputJSONSync(siteConfigPath, siteConfig, {
    spaces: 2
  })
}

export function getSiteConfigSiteId(siteConfig?: SiteConfigJson | null) {
  return siteConfig?.id || ''
}

export function getSiteConfigSiteUrl(
  options?: { siteUrl?: string },
  siteConfig?: SiteConfigJson | null
) {
  return options?.siteUrl || siteConfig?.baseUrl || siteConfig?.siteUrl || process.env.KOOBOO_SITE_URL || ''
}

export function getSiteConfigCredentials(options?: { username?: string; password?: string }) {
  const projectConfig = getConfig('project')
  const globalConfig = getConfig('global')

  return {
    username:
      options?.username ||
      process.env.KOOBOO_USERNAME ||
      projectConfig?.username ||
      globalConfig?.username ||
      '',
    password:
      options?.password ||
      process.env.KOOBOO_PASSWORD ||
      projectConfig?.password ||
      globalConfig?.password ||
      ''
  }
}
