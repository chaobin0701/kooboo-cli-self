import { auth, site, resource } from '@kooboo/core'
import type { AuthConfig, ResourceType } from '@kooboo/core'
import ora from 'ora'
import inquirer, { type DistinctQuestion } from 'inquirer'
import { installUnitTesting } from '../utils/vitest'
import {
  writeModuleResource,
  writeModuleTSConfigJson,
  writeResource,
  writeTemplateProject,
  writeKoobooDefinitions
} from '../utils/writeFile.js'
import path from 'path'

export type CloneActionOptions = {
  site: string
  dir?: string
  template?: 'vitest' | 'empty'
  username?: string
  password?: string
}

const templates: Record<string, string> = {
  vitest: '@kooboo/template-vitest',
  empty: '@kooboo/template-empty'
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
  if (!options.template) {
    questions.push({
      type: 'checkbox',
      name: 'features',
      message: 'Select project features:',
      choices: [{ name: 'Unit Testing', value: 'unit', checked: true }]
    })
  }
  questions.push({
    type: 'list',
    name: 'packageManager',
    message: 'Select package manager:',
    choices: ['pnpm', 'yarn', 'npm']
  })
  const answers = await inquirer.prompt(questions)

  while (true) {
    const username = answers.username || process.env.KOOBOO_USERNAME
    const password = answers.password || process.env.KOOBOO_PASSWORD

    const identifyUserSpinner = ora('Authenticating user...').start()
    try {
      const token = await auth.loginBySite(siteUrl, { username, password })
      authConfig = {
        ...authConfig,
        username,
        password,
        token
      }
      identifyUserSpinner.succeed(`User ${username} authenticated successfully!`)
      break
    } catch (error) {
      identifyUserSpinner.fail(`Failed to authenticate user ${username}!`)
    }
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
  const template = templates[options.template || 'empty'] || options.template || templates['empty']
  await writeTemplateProject({
    targetPath,
    template,
    siteName,
    authConfig
  })

  if (!options.template || options.template === 'empty') {
    // check features
    if (answers.features.includes('unit')) {
      await installUnitTesting(targetPath, answers.packageManager || 'npm')
    }
  }

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
