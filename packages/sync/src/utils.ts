import path from 'node:path'
import normalize from 'normalize-path'
import ora from 'ora'
import crypto from 'crypto'
import fs from 'node:fs'
type ResourceType =
  | 'view'
  | 'style'
  | 'script'
  | 'layout'
  | 'page'
  | 'codeblock'
  | 'pagescript'
  | 'api'
  | 'module'

type ModuleResourceType =
  | 'api'
  | 'code'
  | 'backend'
  | 'file'
  | 'img'
  | 'js'
  | 'root'
  | 'css'
  | 'view'

export type SiteResourceInfo = {
  type: Exclude<ResourceType, 'module'>
  name: string
  ext: string
  relativePath: string
}

export type ModuleResourceInfo = {
  type: 'module'
  moduleName: string
  moduleResourceType: ModuleResourceType
  name: string
  ext: string
  relativePath: string
  folder?: string
}

export type ResourceInfo = SiteResourceInfo | ModuleResourceInfo

const dirToResourceTypeMap: Record<string, ResourceType> = {
  api: 'api',
  code: 'codeblock',
  pagescript: 'pagescript',
  layout: 'layout',
  page: 'page',
  view: 'view',
  css: 'style',
  js: 'script',
  module: 'module'
}

/**
 * 根据文件路径提取资源相关信息
 * @param filePath 本地文件路径
 * @returns 资源信息
 */
export function getResourceInfo(filePath: string): SiteResourceInfo | ModuleResourceInfo {
  const relativePath = normalize(path.relative(getSrcDir(), filePath))
  if (relativePath.startsWith('module/')) {
    return getModuleResourceInfo(filePath)
  }
  return getSiteResourceInfo(filePath)
}

/**
 * 根据文件路径提取站点资源相关信息
 * @param filePath 本地文件路径
 * @returns 站点资源相关信息
 */
export function getSiteResourceInfo(filePath: string): SiteResourceInfo {
  const relativePath = normalize(path.relative(getSrcDir(), filePath))
  const ext = path.extname(filePath)

  const pathArr = relativePath.split('/')
  const dir = pathArr.shift()
  let name = ''

  switch (dir) {
    case 'api':
    case 'code':
    case 'pagescript':
    case 'view':
    case 'layout':
    case 'page':
      name = pathArr.join('.').slice(0, -ext.length)
      break
    case 'css':
    case 'js':
      name = pathArr.join('.')
      break
    default:
      throw new Error(`invalid site resource type: ${dir}`)
  }
  const type = dirToResourceTypeMap[dir]
  if (!type) {
    throw new Error(`invalid site resource type: ${dir}`)
  }
  return {
    type: type as Exclude<ResourceType, 'module'>,
    name,
    ext,
    relativePath
  }
}

/**
 * 根据文件路径提取模块资源相关信息
 * @param filePath 本地文件路径
 * @returns 模块资源相关信息
 */
export function getModuleResourceInfo(filePath: string): ModuleResourceInfo {
  const relativePath = normalize(path.relative(getSrcDir(), filePath))
  const ext = path.extname(filePath)

  const pathArr = relativePath.split('/')
  const isModule = pathArr.shift() === 'module'
  if (!isModule) {
    throw new Error("module path must start with 'module'")
  }
  const moduleName = pathArr.shift() as string
  const moduleResourceType = pathArr.shift()?.toLowerCase() as ModuleResourceType
  let name = ''
  let folder = ''
  switch (moduleResourceType) {
    case 'api':
    case 'code':
    case 'view':
      name = pathArr.pop()?.slice(0, -ext.length) ?? ''
      folder = pathArr.join('/') || '/'
      break
    case 'backend':
    case 'file':
    case 'img':
    case 'root':
    case 'js':
    case 'css':
      name = pathArr.pop() ?? ''
      folder = pathArr.join('/') || '/'
      break
    default:
      throw new Error(`invalid module resource type: ${moduleResourceType}`)
  }
  return {
    type: 'module',
    moduleName,
    moduleResourceType,
    name,
    ext,
    relativePath,
    folder
  }
}

export function getResourceContent(filePath: string) {
  return fs.readFileSync(filePath, 'utf-8')
}

export function checkResourceMatchFileExt(type: ResourceType | ModuleResourceType, ext: string) {
  switch (type) {
    case 'api':
    case 'codeblock':
    case 'code':
    case 'pagescript':
      if (ext !== '.ts' && ext !== '.js') {
        ora(`${type} must be a ts or js file`).fail()
        return false
      }
      break
    case 'view':
    case 'layout':
    case 'page':
      if (ext !== '.html') {
        ora(`${type} must be a html file`).fail()
        return false
      }
      break
    case 'script':
    case 'js':
      if (ext !== '.js') {
        ora(`${type} must be a js file`).fail()
        return false
      }
      break
    case 'style':
    case 'css':
      if (ext !== '.css') {
        ora(`${type} must be a css file`).fail()
        return false
      }
      break
    case 'backend':
    case 'file':
    case 'img':
    case 'root':
      break
    default:
      throw new Error(`invalid resource type: ${type}`)
  }
  return true
}

export function calculateContentHash(content: string) {
  return crypto.createHash('sha256').update(content).digest('hex')
}

export function getSrcDir(...paths: string[]) {
  return path.resolve(process.cwd(), 'src', ...paths)
}
