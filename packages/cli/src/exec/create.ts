import { enterSiteName, enterUsernameAndPassword } from '../utils/enter'
import { writeProjectScaffold, writeKoobooDefinitions } from '../utils/writeFile'
import ora from 'ora'
import { auth, AuthConfig, site } from '@kooboo/core'
import { confirm } from '@inquirer/prompts'
import fse from 'fs-extra'
import path from 'path'

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
  // 循环输入用户名和密码，直到认证成功
  while (true) {
    const { username, password } = await enterUsernameAndPassword()
    const identifyUserSpinner = ora('Identify user...').start()
    try {
      if (host) {
        authConfig.token = await auth.loginByServer(host, {
          username,
          password
        })
      } else {
        const { token, serverUrl } = await auth.loginByServerAndGetServerUrl({
          username,
          password
        })
        authConfig.token = token
        authConfig.serverUrl = serverUrl
      }
      identifyUserSpinner.succeed(`Identify user ${username} success!`)
      // 认证成功后，退出循环
      break
    } catch (error) {
      identifyUserSpinner.fail('Identify user failed!')
    }
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
    const dts = await site.getTypes()
    await writeKoobooDefinitions(dts, targetPath)
  } catch (error) {
    ora('Failed to write kooboo type definitions').fail()
  }
}
