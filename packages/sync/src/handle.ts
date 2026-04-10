import { compileCode, compileHtml } from '@kooboo/compile'
import { checkResourceMatchFileExt } from './utils.js'
import { resource } from '@kooboo/core'
import ora from 'ora'

import type { ResourceInfo } from './utils.js'

export async function handleFileChange(
  filePath: string,
  resourceInfo: ResourceInfo,
  content: string
) {
  // api 和 page 需要url，空白内容未配置url，不做保存
  if (!content && (resourceInfo.type === 'api' || resourceInfo.type === 'page')) {
    return
  }

  if (resourceInfo.type === 'module') {
    // 模块资源
    const { moduleName, moduleResourceType, name, ext, folder, relativePath } = resourceInfo
    if (!checkResourceMatchFileExt(moduleResourceType, ext)) {
      return
    }

    if (['api', 'code', 'backend'].includes(moduleResourceType)) {
      try {
        if (!content) {
          return
        }
        const { code } = compileCode(content, 'kooboo', {
          filename: filePath
        })
        resource.module.saveFileText(moduleName, moduleResourceType, name, code, folder)
      } catch (error) {
        console.error(`Error processing ${filePath}:`, error)
      }
    } else if (['view'].includes(moduleResourceType)) {
      try {
        if (!content) {
          return
        }
        const { html } = compileHtml(content, 'kooboo')
        await resource.module.saveFileText(moduleName, moduleResourceType, name, html)
      } catch (error) {
        console.error(`Error processing ${filePath}:`, error)
      }
    } else if (['root', 'js', 'css'].includes(moduleResourceType)) {
      // 根模块资源
      try {
        if (!content) {
          return
        }
        await resource.module.saveFileText(moduleName, moduleResourceType, name, content, folder)
      } catch (error) {
        console.error(`Error processing ${filePath}:`, error)
      }
    } else {
      // TODO: 支持其他模块资源类型
      console.warn(['Unsupported module resource type', resourceInfo])
      return
    }
    ora(`${relativePath} save success!`).succeed()
  } else {
    // 站点资源
    const { type, name, ext } = resourceInfo
    if (!checkResourceMatchFileExt(type, ext)) {
      return
    }
    if (type === 'api' || type === 'codeblock' || type === 'pagescript') {
      try {
        const { code, config } = compileCode(content, 'kooboo', {
          filename: filePath
        })
        if (type === 'api' && !config?.url) {
          ora(`${name} must have a url`).fail()
          return
        }
        await resource[type].save(name, code, config?.url!)
      } catch (error) {
        console.error(`Error processing ${filePath}:`, error)
      }
    } else if (type === 'layout' || type === 'view' || type === 'page') {
      try {
        const { html, config } = compileHtml(content, 'kooboo')
        if (type === 'page' && !config?.url) {
          ora(`${name} must have a url`).fail()
          return
        }
        await resource[type].save(name, html, config?.url!)
      } catch (error) {
        console.error(`Error processing ${filePath}:`, error)
      }
    } else {
      await resource[type].save(name, content)
    }
    ora(`${type} ${name} save success!`).succeed()
  }
}

export async function handleFileDelete(filePath: string, resourceInfo: ResourceInfo) {
  try {
    if (resourceInfo.type === 'module') {
      const { moduleName, moduleResourceType, name, folder, relativePath } = resourceInfo
      await resource.module.deleteFile(moduleName, moduleResourceType, name, folder)
      ora(`${relativePath} delete success!`).succeed()
    } else {
      // 站点资源
      const { type, name } = resourceInfo
      await resource[type].delete(name)
      ora(`${type} ${name} delete success!`).succeed()
    }
  } catch (error) {
    console.error(`Error deleting ${filePath}:`, error)
  }
}
