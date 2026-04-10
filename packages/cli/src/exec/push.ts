import { checkResource } from '../utils/resources.js'
import ora from 'ora'
import { auth, resource, ResourceType } from '@kooboo/core'
import { getUserNameAndPassword } from '../utils/config.js'
import { watchSiteResourcePaths, execPush } from '@kooboo/sync'
import { glob } from 'glob'
import path from 'node:path'

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
  if (resourceType) {
  } else {
    const files = await glob(
      watchSiteResourcePaths.map((_path) => path.join(_path, '/**/*')),
      {
        nodir: true
      }
    )
    await Promise.all(files.map(async (file) => execPush(file)))
  }
  ora('Push success!').succeed()
}
