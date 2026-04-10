import { auth, site, resource } from '@kooboo/core'
import type { AuthConfig, ResourceType } from '@kooboo/core'
import ora from 'ora'
import inquirer, { type DistinctQuestion } from 'inquirer'
import {
  writeModuleResource,
  writeModuleTSConfigJson,
  writeResource,
  writeProjectScaffold,
  writeKoobooDefinitions
} from '../utils/writeFile.js'
import { retryWithLimit } from '../utils/retry.js'
import path from 'path'

export type CloneActionOptions = {
  site: string
  dir?: string
  username?: string
  password?: string
  includeAgentsMd?: boolean
}

export async function cloneAction(options: CloneActionOptions) {
  const uri = new URL(options.site)
  const siteUrl = `${uri.protocol}//${uri.host}`
  let authConfig: AuthConfig = {
    siteUrl
  }

  const questions: DistinctQuestion[] = []
  // 对于clone，如果没有指定用户名和密码，需要询问。其它操作没有指定直接使用环境变量的值。
  if (!options.username) {
    questions.push({
      type: 'input',
      name: 'username',
      message: 'Username:',
      default: process.env.KOOBOO_USERNAME
    })
  }
  if (!options.password) {
    questions.push({
      type: 'password',
      name: 'password',
      message: 'Password:',
      default: process.env.KOOBOO_PASSWORD
    })
  }
  if (!options.dir) {
    questions.push({
      type: 'input',
      name: 'dir',
      message: 'Enter destination directory (defaults to site name if empty):',
      default: ''
    })
  }
  if (typeof options.includeAgentsMd !== 'boolean') {
    questions.push({
      type: 'confirm',
      name: 'includeAgentsMd',
      message: 'Generate AGENTS.md for AI coding tools?',
      default: true
    })
  }
  const answers = await inquirer.prompt(questions)

  const username = answers.username || process.env.KOOBOO_USERNAME
  const password = answers.password || process.env.KOOBOO_PASSWORD
  if (!username || !password) {
    ora('Username and password are required').fail()
    process.exitCode = 1
    return
  }
  const token = await retryWithLimit(
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

  if (!token) {
    process.exitCode = 1
    return
  }

  authConfig = {
    ...authConfig,
    username,
    password,
    token
  }

  let siteName = ''
  try {
    const { id: siteId, name } = await site.getSite()
    authConfig.siteId = siteId
    siteName = name
  } catch (error) {
    ora('Failed to get site information!').fail()
    return
  }

  // Create local project
  const targetPath = path.join(process.cwd(), answers.dir || options.dir || siteName)
  await writeProjectScaffold({
    targetPath,
    siteName,
    authConfig,
    includeAgentsMd: options.includeAgentsMd ?? answers.includeAgentsMd ?? false
  })

  async function cloneAllResource() {
    const resourceList = await resource.loadResourceList()
    const promises = resourceList.flatMap(({ type, list }) => {
      const resourceType = type as ResourceType
      return list.map(async ({ id }) => {
        const data = await resource[resourceType].getById(id)
        if (resourceType === 'pagescript' && !data.name) {
          return
        }
        await writeResource(resourceType, data, targetPath)
      })
    })
    return Promise.all(promises)
  }

  async function cloneAllModuleResource() {
    const moduleList = await resource.module.getList()
    const promises = moduleList.flatMap(async (module) => {
      const { name } = module
      const fileList = await resource.module.getFileList(name)

      const filePromises = fileList
        .map(async ({ name: fileName, objectType, folderName }) => {
          if (objectType === 'img' || objectType === 'file') {
            return
          }
          const data = await resource.module.getFileText(name, objectType, fileName, folderName)
          await writeModuleResource(
            {
              moduleName: name,
              moduleResourceType: objectType,
              fileName,
              body: data
            },
            targetPath
          )
        })
        .filter(Boolean) // Filter out undefined returns

      // Add Promise for writing tsconfig
      filePromises.push(writeModuleTSConfigJson(name, targetPath))

      return Promise.all(filePromises)
    })

    return Promise.all(promises)
  }

  async function cloneTypes() {
    const dts = await site.getTypes()
    await writeKoobooDefinitions(dts, targetPath)
  }

  // Correctly execute functions in parallel and wait for all to complete
  await Promise.all([cloneAllResource(), cloneAllModuleResource(), cloneTypes()])

  ora('Site cloned successfully!').succeed()
}
