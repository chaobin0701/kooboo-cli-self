import fs from 'node:fs'
import path from 'node:path'
import { glob } from 'glob'
import { getResourceContent, getResourceInfo, checkResourceMatchFileExt } from './utils.js'
import { handleFileChange } from './handle.js'
import type { ResourceInfo } from './utils.js'

export type DeploymentResolution = {
  files: string[]
  missing: string[]
  empty: string[]
}

const globMagicPattern = /[*?[\]{}()!+@]/

function isGlobPattern(input: string) {
  return globMagicPattern.test(input)
}

function unique(values: string[]) {
  return [...new Set(values)]
}

function describeResource(resourceInfo: ResourceInfo) {
  if (resourceInfo.type === 'module') {
    return `module ${resourceInfo.moduleName}/${resourceInfo.moduleResourceType}/${resourceInfo.name}`
  }
  return `${resourceInfo.type} ${resourceInfo.name}`
}

function getExpectedFormat(resourceInfo: ResourceInfo) {
  if (resourceInfo.type === 'module') {
    switch (resourceInfo.moduleResourceType) {
      case 'api':
      case 'code':
      case 'backend':
        return 'a .ts or .js file'
      case 'view':
        return 'a .html file'
      case 'js':
        return 'a .js file'
      case 'css':
        return 'a .css file'
      case 'root':
      case 'file':
      case 'img':
        return 'a valid module asset file'
      default:
        return 'a valid module resource file'
    }
  }

  switch (resourceInfo.type) {
    case 'api':
    case 'codeblock':
    case 'pagescript':
      return 'a .ts or .js file'
    case 'layout':
    case 'view':
    case 'page':
      return 'a .html file'
    case 'script':
      return 'a .js file'
    case 'style':
      return 'a .css file'
    default:
      return 'a valid resource file'
  }
}

export async function resolveDeploymentTargets(
  inputs: string[],
  cwd = process.cwd()
): Promise<DeploymentResolution> {
  const files: string[] = []
  const missing: string[] = []
  const empty: string[] = []

  for (const input of inputs) {
    const absoluteInput = path.resolve(cwd, input)

    if (isGlobPattern(input)) {
      const matches = await glob(absoluteInput, { nodir: true })
      if (!matches.length) {
        empty.push(input)
        continue
      }
      files.push(...matches)
      continue
    }

    if (!fs.existsSync(absoluteInput)) {
      missing.push(input)
      continue
    }

    const stat = fs.statSync(absoluteInput)
    if (stat.isDirectory()) {
      const matches = await glob(path.join(absoluteInput, '**/*'), {
        nodir: true
      })
      if (!matches.length) {
        empty.push(input)
        continue
      }
      files.push(...matches)
      continue
    }

    if (stat.isFile()) {
      files.push(absoluteInput)
      continue
    }

    missing.push(input)
  }

  return {
    files: unique(files),
    missing: unique(missing),
    empty: unique(empty)
  }
}

export async function deployFiles(filePaths: string[]) {
  if (!filePaths.length) {
    return
  }

  for (const filePath of filePaths) {
    try {
      const resourceInfo = getResourceInfo(filePath)
      const content = getResourceContent(filePath)
      if (!checkResourceMatchFileExt(
        resourceInfo.type === 'module' ? resourceInfo.moduleResourceType : resourceInfo.type,
        resourceInfo.ext
      )) {
        throw new Error(
          `${filePath} is recognized as ${describeResource(resourceInfo)} and must be ${getExpectedFormat(resourceInfo)}`
        )
      }
      const ok = await handleFileChange(filePath, resourceInfo, content)
      if (!ok) {
        throw new Error(
          `${filePath} is recognized as ${describeResource(resourceInfo)} but Kooboo rejected it`
        )
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error)
      throw new Error(`Deploy failed for ${filePath}: ${reason}`)
    }
  }
}
