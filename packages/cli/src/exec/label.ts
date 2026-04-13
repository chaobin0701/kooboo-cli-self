import fs from 'fs-extra'
import ora from 'ora'
import path from 'node:path'
import { auth, label, site } from '@kooboo/core'
import { retryWithLimit } from '../utils/retry.js'
import {
  getSiteConfigCredentials,
  getSiteConfigSiteId,
  getSiteConfigSiteUrl,
  readSiteConfig
} from '../utils/siteConfig.js'
import { getLabelCachePath, readLabelCache, writeLabelCache } from '../utils/label.js'

export type LabelActionOptions = {
  siteUrl?: string
  username?: string
  password?: string
  projectPath?: string
}

export type LabelSetActionOptions = LabelActionOptions & {
  values?: string
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

async function resolveSiteId(localSiteConfig: ReturnType<typeof readSiteConfig>) {
  const siteId = getSiteConfigSiteId(localSiteConfig)
  if (siteId) {
    return siteId
  }
  return (await site.getSite()).id
}

async function pullRemoteLabels(projectPath: string, siteId: string) {
  const remoteLabels = await label.getLabelList(siteId)
  writeLabelCache(remoteLabels, projectPath)
  return remoteLabels
}

function parseLabelValues(values?: string) {
  if (!values) {
    throw new Error('Label values JSON is required')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(values)
  } catch (error) {
    throw new Error(`Label values must be valid JSON: ${error}`)
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Label values must be a JSON object')
  }

  for (const [culture, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (typeof value !== 'string') {
      throw new Error(`Label values for "${culture}" must be a string`)
    }
  }

  return parsed as Record<string, string>
}

function parseLabelImportPayload(fileContent: string) {
  let parsed: unknown
  try {
    parsed = JSON.parse(fileContent)
  } catch (error) {
    throw new Error(`Label import file must be valid JSON: ${error}`)
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Label import file must be a JSON object')
  }

  for (const [culture, values] of Object.entries(parsed as Record<string, unknown>)) {
    if (!values || typeof values !== 'object' || Array.isArray(values)) {
      throw new Error(`Label import values for "${culture}" must be a JSON object`)
    }

    for (const [key, value] of Object.entries(values as Record<string, unknown>)) {
      if (typeof value !== 'string') {
        throw new Error(`Label import value "${culture}.${key}" must be a string`)
      }
    }
  }

  return parsed as Record<string, Record<string, string>>
}

async function refreshLocalLabelCache(projectPath: string, siteId: string) {
  const labels = await pullRemoteLabels(projectPath, siteId)
  return labels
}

export async function pullLabelAction(options: LabelActionOptions = {}) {
  const projectPath = options.projectPath || process.cwd()
  const localSiteConfig = readSiteConfig(projectPath)
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

  const spinner = ora('Loading labels...').start()
  try {
    const siteId = await resolveSiteId(localSiteConfig)
    const labels = await pullRemoteLabels(projectPath, siteId)
    spinner.succeed(`Labels saved to ${getLabelCachePath(projectPath)} (${labels.length} items)`)
  } catch (error) {
    spinner.fail(`Load labels failed: ${error}`)
    process.exitCode = 1
  }
}

export async function showLabelAction(projectPath = process.cwd()) {
  const labels = readLabelCache(projectPath)
  if (!labels) {
    ora('No local labels found').fail()
    process.exitCode = 1
    return
  }

  console.log(JSON.stringify(labels, null, 2))
}

export async function setLabelAction(
  key: string,
  options: LabelSetActionOptions = {}
) {
  const projectPath = options.projectPath || process.cwd()
  const localSiteConfig = readSiteConfig(projectPath)
  const siteUrl = getSiteConfigSiteUrl(options, localSiteConfig)
  const { username, password } = getSiteConfigCredentials(options)
  const values = parseLabelValues(options.values)

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

  const spinner = ora(`Saving label ${key}...`).start()
  try {
    const siteId = await resolveSiteId(localSiteConfig)
    await label.upsertLabel({ key, values }, siteId)
    try {
      const labels = await refreshLocalLabelCache(projectPath, siteId)
      spinner.succeed(`Label ${key} saved successfully! (${labels.length} items cached)`)
    } catch (refreshError) {
      spinner.succeed(`Label ${key} saved successfully!`)
      ora(`Label cache refresh failed: ${refreshError}`).warn()
    }
  } catch (error) {
    spinner.fail(`Save label failed: ${error}`)
    process.exitCode = 1
  }
}

export async function importLabelAction(
  filePath: string,
  options: LabelActionOptions = {}
) {
  const projectPath = options.projectPath || process.cwd()
  const localSiteConfig = readSiteConfig(projectPath)
  const siteUrl = getSiteConfigSiteUrl(options, localSiteConfig)
  const { username, password } = getSiteConfigCredentials(options)

  if (!fs.existsSync(filePath)) {
    ora(`Label file not found: ${filePath}`).fail()
    process.exitCode = 1
    return
  }

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

  const spinner = ora(`Importing labels from ${path.basename(filePath)}...`).start()
  try {
    const siteId = await resolveSiteId(localSiteConfig)
    const fileContent = await fs.readFile(filePath, 'utf8')
    parseLabelImportPayload(fileContent)
    await label.importLabelFile(fileContent, path.basename(filePath), siteId)
    try {
      const labels = await refreshLocalLabelCache(projectPath, siteId)
      spinner.succeed(`Labels imported successfully! (${labels.length} items cached)`)
    } catch (refreshError) {
      spinner.succeed('Labels imported successfully!')
      ora(`Label cache refresh failed: ${refreshError}`).warn()
    }
  } catch (error) {
    spinner.fail(`Import labels failed: ${error}`)
    process.exitCode = 1
  }
}

export async function autoPullLabels(projectPath: string, siteId: string) {
  const spinner = ora('Loading labels...').start()
  try {
    const labels = await refreshLocalLabelCache(projectPath, siteId)
    spinner.succeed(`Labels saved to ${getLabelCachePath(projectPath)} (${labels.length} items)`)
    return labels
  } catch (error) {
    spinner.warn(`Failed to sync labels: ${error}`)
    return null
  }
}
