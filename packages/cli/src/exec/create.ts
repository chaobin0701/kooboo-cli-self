import { enterSiteName, enterUsernameAndPassword } from '../utils/enter'
import { writeProjectScaffold, writeKoobooDefinitions } from '../utils/writeFile'
import ora from 'ora'
import { auth, AuthConfig, site } from '@kooboo/core'
import { confirm } from '@inquirer/prompts'
import fse from 'fs-extra'
import path from 'path'
import { retryWithLimit } from '../utils/retry'
import { writeSiteConfig } from '../utils/siteConfig'
import { autoPullLabels } from './label'

interface CreateOptions {
  host?: string
}

export async function createAction(siteName: string, options: CreateOptions) {
  const { host } = options
  const authConfig: AuthConfig = {
    siteUrl: '',
    siteId: '',
    token: '',
    serverUrl: '',
    username: '',
    password: ''
  }
  const { username, password } = await enterUsernameAndPassword()
  const loginResult = await retryWithLimit(
    async () => {
      if (host) {
        return await auth.loginByServer(host, {
          username,
          password
        })
      }

      return await auth.loginByServerAndGetServerUrl({
        username,
        password
      })
    },
    {
      attempts: 3,
      message: 'Identify user...',
      successMessage: (result) => {
        if (typeof result === 'string') {
          authConfig.token = result
          return `Identify user ${username} success!`
        }

        authConfig.token = result.token
        authConfig.serverUrl = result.serverUrl
        return `Identify user ${username} success!`
      },
      failureMessage: (_attempt, attempts) =>
        `Identify user failed! (${_attempt}/${attempts})`,
      finalFailureMessage: (attempts) =>
        `Identify user failed after ${attempts} attempts, stop retrying.`
    }
  )

  if (!loginResult) {
    process.exitCode = 1
    return
  }

  // 创建站点
  if (!siteName) {
    siteName = await enterSiteName()
  }

  const createSiteSpinner = ora('Create site...').start()
  try {
    const { siteUrl, id } = await site.createSite(siteName)
    createSiteSpinner.succeed('Create site success!')
    authConfig.siteUrl = siteUrl
    authConfig.siteId = id
  } catch (error) {
    createSiteSpinner.fail('Create site failed!')
    return process.exit(1)
  }

  const targetPath = path.join(process.cwd(), siteName)

  if (fse.existsSync(targetPath)) {
    const empty = await confirm({
      message: 'The directory is not empty, whether to clear'
    })
    if (empty) {
      fse.emptyDirSync(targetPath)
    } else {
      process.exit(0)
    }
  }

  await writeProjectScaffold({ targetPath, siteName, authConfig })

  try {
    const remoteSiteConfig = await site.getSiteConfig(authConfig.siteId)
    writeSiteConfig(remoteSiteConfig, targetPath)
  } catch (error) {
    ora(`Failed to write site config: ${error}`).fail()
  }

  await autoPullLabels(targetPath, authConfig.siteId)

  try {
    const dts = await site.getTypes()
    await writeKoobooDefinitions(dts, targetPath)
  } catch (error) {
    ora('Failed to write kooboo type definitions').fail()
  }
}
