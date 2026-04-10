import type { AuthConfig, Resource, ResourceType } from '@kooboo/core'
import { compileCode, compileHtml } from '@kooboo/compile'
import { NpmPackage } from '@kooboo/utils'
import fse from 'fs-extra'
import ora from 'ora'
import os from 'node:os'
import path from 'node:path'
import ejs from 'ejs'
import { glob } from 'glob'
import { ModuleResourceType } from '@kooboo/core'
import moduleTSConfig from '../dataTemplate/moduleTSConfig.js'
import { envTemplateConfig, gitignore } from '../dataTemplate/constants.js'

const resourceTypeDirMap = {
  api: 'api',
  codeblock: 'code',
  pagescript: 'pagescript',
  layout: 'layout',
  page: 'page',
  view: 'view',
  style: 'css',
  script: 'js'
}

const moduleResourceTypeDirMap = {
  code: 'code',
  api: 'api',
  view: 'view',
  css: 'css',
  js: 'js',
  root: 'root',
  img: 'img',
  file: 'file',
  backend: 'backend'
}

export async function writeTemplateProject({
  targetPath,
  template,
  siteName,
  authConfig
}: {
  targetPath: string
  template: string
  siteName: string
  authConfig: AuthConfig
}) {
  const pkg = new NpmPackage({
    name: template,
    targetPath: path.join(os.homedir(), '.kooboo-template')
  })

  if (!(await pkg.exists())) {
    const downloadTemplateSpinner = ora('Downloading template...').start()
    await pkg.install()
    downloadTemplateSpinner.stop()
  } else {
    const updateTemplateSpinner = ora('Updating template...').start()
    await pkg.update()
    updateTemplateSpinner.stop()
  }
  const createProjectSpinner = ora('Creating project...').start()
  const templatePath = pkg.npmFilePath
  fse.copySync(templatePath, targetPath)

  // 处理 package.json
  const packageJsonPath = path.join(targetPath, 'package.json')
  if (fse.existsSync(packageJsonPath)) {
    const packageJson = fse.readJsonSync(packageJsonPath)

    // 修改必要的字段
    packageJson.name = siteName
    packageJson.version = '1.0.0'

    // 删除不必要的字段
    delete packageJson.publishConfig
    delete packageJson.__npminstall_done
    delete packageJson._from
    delete packageJson._resolved

    // 写回文件
    fse.writeJsonSync(packageJsonPath, packageJson, { spaces: 2 })
  }

  // write .gitignore
  fse.writeFileSync(path.join(targetPath, '.gitignore'), gitignore)

  // write .env, .env.example
  const env: Record<string, string | undefined> = {
    KOOBOO_SITE_URL: authConfig.siteUrl,
    KOOBOO_USERNAME: authConfig.username,
    KOOBOO_PASSWORD: authConfig.password
  }
  await writeDefaultEnvFiles(targetPath, env)

  fse.removeSync(path.join(targetPath, 'CHANGELOG.md'))
  fse.removeSync(path.join(targetPath, 'node_modules'))
  createProjectSpinner.succeed('Create project success!')
}

async function writeDefaultEnvFiles(targetPath: string, env: Record<string, string | undefined>) {
  for (const key in envTemplateConfig) {
    const envString = ejs.render(envTemplateConfig[key], env)
    fse.writeFileSync(path.join(targetPath, key), envString)
  }

  const files = await glob('.env*', {
    cwd: targetPath,
    nodir: true,
    dot: true // 添加dot选项以匹配以点开头的文件，如.env
  })
  for (let i = 0; i < files.length; i++) {
    const filePath = path.join(targetPath, files[i])
    const renderSpinner = ora(`Rendering file ${filePath}...`).start()
    try {
      const renderResult = await ejs.renderFile(filePath, env)
      fse.writeFileSync(filePath, renderResult)
      renderSpinner.succeed(`Render file ${filePath} success`)
    } catch (error) {
      renderSpinner.fail(`Render file ${filePath} failed: ${error}`)
    }
  }

  upsertLine(path.join(targetPath, '.gitignore'), '.env', (line) => line?.trim() === '.env')
}

export async function writeResource<T extends ResourceType>(
  resourceType: T,
  resource: Resource[T],
  projectPath: string
) {
  const { name } = resource
  const resourceDir = path.join(projectPath, 'src', resourceTypeDirMap[resourceType])
  let localPath = ''
  let resourceBody = ''
  try {
    switch (resourceType) {
      case 'api':
      case 'codeblock':
      case 'pagescript':
        localPath = `${path.join(...name.split('.'))}.ts`
        resourceBody = resource.body
          ? compileCode(resource.body, 'local', {
              config:
                resourceType === 'api' ? { url: (resource as Resource['api']).url } : undefined
            }).code || ''
          : ''
        break
      case 'script':
      case 'style':
        const pathParts = name.split('.')
        const ext = pathParts.pop()
        localPath = `${path.join(...pathParts)}.${ext}`
        resourceBody = resource.body
        break
      case 'layout':
      case 'page':
      case 'view':
        localPath = `${path.join(...name.split('.'))}.html`
        resourceBody = resource.body
          ? compileHtml(
              resource.body,
              'local',
              resourceType === 'page' ? { url: (resource as Resource['page']).urlPath! } : undefined
            ).html || ''
          : ''
        break
    }
  } catch (error) {
    ora(`Write resource failed! type: ${resourceType} name: ${name}`).fail()
    console.log(resource)
    console.log(error)
  }

  const filePath = path.join(resourceDir, localPath)
  fse.outputFile(filePath, resourceBody || '')
  ora(`Write ${filePath} success!`).succeed()
}

export async function writeModuleResource(
  {
    moduleName,
    moduleResourceType,
    fileName,
    body
  }: {
    moduleName: string
    moduleResourceType: ModuleResourceType
    fileName: string
    body: string
  },
  projectPath: string
) {
  const moduleDir = path.join(
    projectPath,
    'src',
    'module',
    moduleName,
    moduleResourceTypeDirMap[moduleResourceType]
  )

  let localPath = ''
  let resourceBody = ''
  switch (moduleResourceType) {
    case 'code':
    case 'api':
      localPath = `${path.join(...fileName.split('.'))}.ts`
      resourceBody = compileCode(body, 'local').code || ''
      break
    case 'view':
      localPath = `${path.join(...fileName.split('.'))}.html`
      resourceBody = compileHtml(body, 'local').html || ''
      break
    case 'img':
    case 'file':
      break
    default:
      const pathParts = fileName.split('.')
      const ext = pathParts.pop()
      localPath = `${path.join(...pathParts)}.${ext}`
      resourceBody = body
      break
  }

  fse.outputFile(path.join(moduleDir, localPath), resourceBody || '')
}

export async function writeModuleTSConfigJson(moduleName: string, projectPath: string) {
  const tsConfigPath = path.join(projectPath, 'src', 'module', moduleName, 'tsconfig.json')

  fse.outputFileSync(tsConfigPath, JSON.stringify(moduleTSConfig, null, 2))
}

export async function writeKoobooDefinitions(dts: string, projectPath: string) {
  const dtsPath = path.join(projectPath, 'kooboo.d.ts')
  await fse.outputFile(dtsPath, dts, {
    encoding: 'utf-8'
  })
}

export function upsertLine(file: string, newLine: string, match: (line: string) => boolean) {
  if (!fse.existsSync(file)) {
    fse.writeFileSync(file, newLine)
    return
  }
  const lines = fse.readFileSync(file, { encoding: 'utf-8' }).split(os.EOL)
  const index = lines.findIndex((line) => match(line))
  if (index > -1) {
    lines[index] = newLine
  } else {
    lines.push(newLine)
  }

  fse.writeFileSync(file, lines.join(os.EOL))
}

export const lockFilePath = (projectPath: string) => path.resolve(projectPath, 'kooboo-cli.lock')
