import fs from 'node:fs'
import path from 'node:path'
import ora from 'ora'
import { auth, resource } from '@kooboo/core'
import { getUserNameAndPassword } from '../utils/config.js'
import { execPush } from '@kooboo/sync'

export async function deployAction(
  files: string[],
  options: { siteUrl?: string; username?: string; password?: string } = {}
) {
  const siteUrl = options.siteUrl || process.env.KOOBOO_SITE_URL
  const userInfo =
    options.username && options.password
      ? { username: options.username, password: options.password }
      : getUserNameAndPassword()

  if (!siteUrl || !userInfo) {
    ora('KOOBOO_SITE_URL, KOOBOO_USERNAME, KOOBOO_PASSWORD is required').fail()
    return
  }

  const { username, password } = userInfo
  const identifyUserSpinner = ora('Identify user...').start()
  try {
    await auth.loginBySite(siteUrl, { username, password })
    identifyUserSpinner.succeed(`Identify user ${username} success!`)
  } catch (error) {
    identifyUserSpinner.fail('Identify user failed!')
    return
  }

  await resource.loadResourceList()

  const absFiles = files.map((file) => path.resolve(process.cwd(), file))
  const missing = absFiles.filter((file) => !fs.existsSync(file))
  if (missing.length) {
    ora(`File not found: ${missing.join(', ')}`).fail()
    process.exitCode = 1
    return
  }

  const spinner = ora(`Deploying ${absFiles.length} file(s)...`).start()
  try {
    for (const filePath of absFiles) {
      await execPush(filePath)
    }
    spinner.succeed('Deploy success!')
  } catch (error) {
    spinner.fail(`Deploy failed: ${error}`)
    process.exitCode = 1
  }
}
