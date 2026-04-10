import ora from 'ora'
import { auth, resource } from '@kooboo/core'
import { getUserNameAndPassword } from '../utils/config.js'
import { deployFiles, resolveDeploymentTargets } from '@kooboo/sync'

export async function deployAction(
  files: string[],
  options: { siteUrl?: string; username?: string; password?: string } = {}
) {
  const siteUrl = options.siteUrl || process.env.KOOBOO_SITE_URL
  const envUserInfo = getUserNameAndPassword()
  const userInfo = {
    username: options.username || envUserInfo?.username || '',
    password: options.password || envUserInfo?.password || ''
  }

  if (!siteUrl || !userInfo.username || !userInfo.password) {
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

  const resolution = await resolveDeploymentTargets(files)
  if (resolution.missing.length) {
    ora(`File not found: ${resolution.missing.join(', ')}`).fail()
    process.exitCode = 1
    return
  }
  if (resolution.empty.length) {
    ora(`No deployable files found for: ${resolution.empty.join(', ')}`).fail()
    process.exitCode = 1
    return
  }

  const spinner = ora(`Deploying ${resolution.files.length} file(s)...`).start()
  try {
    await deployFiles(resolution.files)
    spinner.succeed('Deploy success!')
  } catch (error) {
    spinner.fail(`Deploy failed: ${error}`)
    process.exitCode = 1
  }
}
