import { checkResource } from '../utils/resources.js'
import ora from 'ora'
import { auth, resource, ResourceType, site } from '@kooboo/core'
import { getUserNameAndPassword } from '../utils/config.js'
import { minimatch } from 'minimatch'
import {
  writeModuleResource,
  writeModuleTSConfigJson,
  writeKoobooDefinitions,
  writeResource,
  lockFilePath
} from '../utils/writeFile.js'
import { remove, ensureFileSync } from 'fs-extra'
import { resolve } from 'path'

export async function pullAction(resourceType?: ResourceType, name?: string) {
  const siteUrl = process.env.KOOBOO_SITE_URL
  const userInfo = getUserNameAndPassword()
  if (!userInfo || !siteUrl) {
    ora('KOOBOO_SITE_URL, KOOBOO_USERNAME, KOOBOO_PASSWORD is required').fail()
    return
  }

  if (resourceType && !checkResource(resourceType)) {
    ora(`Resource ${resourceType} is not supported`).fail()
    return
  }

  const { username, password } = userInfo
  const identifyUserSpinner = ora('Identify user...').start()
  try {
    await auth.loginBySite(siteUrl, { username, password })
    identifyUserSpinner.succeed(`Identify user ${username} success!`)
  } catch {
    identifyUserSpinner.fail('Identify user failed!')
    return
  }

  const projectPath = process.cwd()
  // generate kooboo.lock file
  const lockFile = lockFilePath(projectPath)
  try {
    ensureFileSync(lockFile)

    const types = await site.getTypes()
    await writeKoobooDefinitions(types, projectPath)

    if (resourceType) {
      await pullSpecificResource(resourceType, name, projectPath)
    } else {
      await pullAllResources(name, projectPath)
    }
  } catch {
    ora('Pull resources failed!').fail()
  } finally {
    await remove(lockFile)
  }
}

// 拉取特定资源
async function pullSpecificResource(
  resourceType: ResourceType,
  name: string | undefined,
  projectPath: string
) {
  if (['module', 'm'].includes(resourceType)) {
    await pullModules(name, projectPath)
  } else {
    const itemList = await resource[resourceType].getList()
    await pullResource(itemList, resourceType, projectPath, name)
  }
}

// 拉取所有资源
async function pullAllResources(name: string | undefined, projectPath: string) {
  const resourceList = await resource.loadResourceList()
  for (const res of resourceList) {
    if (res.list.length) {
      await pullResource(res.list, res.type as ResourceType, projectPath, name)
    }
  }
  await pullModules(name, projectPath)
}

// 拉取模块
async function pullModules(filter: string | undefined, projectPath: string) {
  const moduleList = await resource.module.getList()
  for (const { name, online } of moduleList) {
    if (!online) {
      ora(`Module ${name} is not online, skip`).warn()
      continue
    }

    if (filter && !minimatch(name, filter)) {
      continue
    }

    await pullModule(name, projectPath)
  }
}

async function pullModule(name: string, projectPath: string) {
  const fileList = await resource.module.getFileList(name)
  if (!fileList.length) {
    ora(`Module ${name} not found`).fail()
    return
  }
  await remove(resolve(projectPath, 'src', 'module', name))

  const filePromises = fileList
    .map(async ({ name: fileName, objectType, folderName }) => {
      if (objectType === 'img' || objectType === 'file') {
        return
      }

      try {
        const data = await resource.module.getFileText(name, objectType, fileName, folderName)
        await writeModuleResource(
          {
            moduleName: name,
            moduleResourceType: objectType,
            fileName,
            body: data
          },
          projectPath
        )
      } catch (error) {
        ora(`Pull module ${name} ${fileName} failed!`).fail()
      }
    })
    .filter(Boolean) // 过滤掉 undefined 返回值

  // 添加写入 tsconfig 的 Promise
  filePromises.push(writeModuleTSConfigJson(name, projectPath))
  await Promise.all(filePromises)
  ora(`Pull module ${name} success!`).succeed()
}

async function pullResource(
  itemList: any[],
  resourceType: ResourceType,
  projectPath: string,
  filter?: string
) {
  for (const it of itemList) {
    if (filter && !minimatch(it.name, filter)) {
      continue
    }
    const data = await resource[resourceType].getById(it.id)
    if (resourceType === 'pagescript' && !data.name) {
      continue
    }
    await writeResource(resourceType, data, projectPath)
  }
}
