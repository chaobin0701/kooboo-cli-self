import ora from 'ora'
import { auth, site } from '@kooboo/core'
import { retryWithLimit } from '../utils/retry.js'
import {
  getSiteConfigCredentials,
  getSiteConfigPath,
  getSiteConfigSiteId,
  getSiteConfigSiteUrl,
  readSiteConfig,
  writeSiteConfig
} from '../utils/siteConfig.js'

export type SiteConfigActionOptions = {
  siteUrl?: string
  username?: string
  password?: string
}

async function authenticate(siteUrl: string, username: string, password: string) {
  return retryWithLimit(
    () => auth.loginBySite(siteUrl, { username, password }),
    {
      attempts: 3,
      message: 'Authenticating user...',
      successMessage: () => `User ${username} authenticated successfully!`,
      failureMessage: (attempt, attempts) =>
        `Failed to authenticate user ${username}! (${attempt}/${attempts})`,
      finalFailureMessage: (attempts) =>
        `Failed to authenticate user ${username} after ${attempts} attempts, stop retrying.`
    }
  )
}

export async function pullSiteConfigAction(options: SiteConfigActionOptions = {}) {
  const localSiteConfig = readSiteConfig()
  const siteUrl = getSiteConfigSiteUrl(options, localSiteConfig)
  const { username, password } = getSiteConfigCredentials(options)

  if (!siteUrl || !username || !password) {
    ora('KOOBOO_SITE_URL, KOOBOO_USERNAME, KOOBOO_PASSWORD are required').fail()
    process.exitCode = 1
    return
  }

  const token = await authenticate(siteUrl, username, password)
  if (!token) {
    process.exitCode = 1
    return
  }

  const spinner = ora('Loading site config...').start()
  try {
    const siteId = getSiteConfigSiteId(localSiteConfig) || (await site.getSite()).id
    const remoteSiteConfig = await site.getSiteConfig(siteId)
    writeSiteConfig(remoteSiteConfig)
    spinner.succeed(`Site config saved to ${getSiteConfigPath()}`)
  } catch (error) {
    spinner.fail(`Load site config failed: ${error}`)
    process.exitCode = 1
  }
}

export async function pushSiteConfigAction(options: SiteConfigActionOptions = {}) {
  const localSiteConfig = readSiteConfig()
  if (!localSiteConfig) {
    ora('No local siteConfig found, please run kbs config site pull first').fail()
    process.exitCode = 1
    return
  }

  const siteId = getSiteConfigSiteId(localSiteConfig)
  if (!siteId) {
    ora('Local siteConfig is missing id, please run kbs config site pull again').fail()
    process.exitCode = 1
    return
  }

  const siteUrl = getSiteConfigSiteUrl(options, localSiteConfig)
  const { username, password } = getSiteConfigCredentials(options)

  if (!siteUrl || !username || !password) {
    ora('KOOBOO_SITE_URL, KOOBOO_USERNAME, KOOBOO_PASSWORD are required').fail()
    process.exitCode = 1
    return
  }

  const token = await authenticate(siteUrl, username, password)
  if (!token) {
    process.exitCode = 1
    return
  }

  const spinner = ora('Pushing site config...').start()
  try {
    await site.updateSiteConfig(localSiteConfig, siteId)
    spinner.succeed('Site config pushed successfully!')
  } catch (error) {
    spinner.fail(`Push site config failed: ${error}`)
    process.exitCode = 1
  }
}

export async function showSiteConfigAction() {
  const localSiteConfig = readSiteConfig()
  if (!localSiteConfig) {
    ora('No local siteConfig found').fail()
    process.exitCode = 1
    return
  }

  console.log(JSON.stringify(localSiteConfig, null, 2))
}
