import { checkResource, type ResourceType } from '../utils/resources.js'
import ora from 'ora'
import { auth, resource } from '@kooboo/core'
import { getUserNameAndPassword } from '../utils/config.js'
import { watchSiteResourcePaths, watchModuleResourcePaths, execPush } from '@kooboo/sync'
import { glob } from 'glob'
import { minimatch } from 'minimatch'
import path from 'node:path'

const siteResourceDirMap: Record<ResourceType, string> = {
  api: 'api',
  codeblock: 'code',
  module: 'module',
  layout: 'layout',
  page: 'page',
  view: 'view',
  script: 'js',
  style: 'css'
}

function getResourceNameFromPath(filePath: string) {
  const relativePath = path.relative(path.join(process.cwd(), 'src'), filePath)
  const parts = relativePath.split(path.sep)
  const ext = path.extname(filePath)

  if (parts[0] === 'module') {
    return parts.slice(2).join('.').slice(0, -ext.length)
  }

  return parts.slice(1).join('.').slice(0, -ext.length)
}

function matchesPushTarget(filePath: string, resourceType: ResourceType, name?: string) {
  const relativePath = path.relative(path.join(process.cwd(), 'src'), filePath)
  const parts = relativePath.split(path.sep)
  const dir = parts[0]

  if (resourceType === 'module') {
    if (dir !== 'module') {
      return false
    }
    if (!name) {
      return true
    }
    return minimatch(parts[1], name)
  }

  if (siteResourceDirMap[resourceType] !== dir) {
    return false
  }

  if (!name) {
    return true
  }

  return minimatch(getResourceNameFromPath(filePath), name)
}

function getPushPatterns(resourceType?: ResourceType) {
  if (!resourceType) {
    return [
      ...watchSiteResourcePaths.map((_path) => path.join(_path, '**/*')),
      ...watchModuleResourcePaths.map((_path) => path.join(_path, '**/*'))
    ]
  }

  if (resourceType === 'module') {
    return watchModuleResourcePaths.map((_path) => path.join(_path, '**/*'))
  }

  return [path.join(process.cwd(), 'src', siteResourceDirMap[resourceType], '**/*')]
}

export async function pushAction(resourceType?: ResourceType, name?: string) {
  const siteUrl = process.env.KOOBOO_SITE_URL

  const userInfo = getUserNameAndPassword()
  if (!userInfo || !siteUrl) {
    ora('KOOBOO_SITE_URL, KOOBOO_USERNAME, KOOBOO_PASSWORD is required').fail()
    return
  }
  const { username, password } = userInfo

  if (resourceType && !checkResource(resourceType)) {
    ora(`Resource ${resourceType} is not supported`).fail()
    return
  }

  const identifyUserSpinner = ora('Identify user...').start()
  try {
    await auth.loginBySite(siteUrl, { username, password })
    identifyUserSpinner.succeed(`Identify user ${username} success!`)
  } catch (error) {
    identifyUserSpinner.fail('Identify user failed!')
    return
  }
  await resource.loadResourceList()

  const files = await glob(getPushPatterns(resourceType), {
    nodir: true
  })

  await Promise.all(
    files
      .filter((file) => !resourceType || matchesPushTarget(file, resourceType, name))
      .map(async (file) => execPush(file))
  )

  ora('Push success!').succeed()
}
