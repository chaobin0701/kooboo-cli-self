import { koobooContext } from '../../config/context.js'

import * as codeApi from './code.js'
import * as layoutApi from './layout.js'
import * as moduleApi from './module.js'
import * as pageApi from './page.js'
import * as scriptApi from './script.js'
import * as styleApi from './style.js'
import * as viewApi from './view'

import type { ModuleResourceType } from '../../types/module.js'

export { codeApi, layoutApi, pageApi, scriptApi, styleApi, viewApi, moduleApi }

const emptyGuid = '00000000-0000-0000-0000-000000000000'

export const api = {
  async getList() {
    const list = await codeApi.getListByType('Api')
    list.forEach((item) => {
      koobooContext.resourceMetadata.api[item.name] = {
        id: item.id,
        version: item.version || 0,
        name: item.name
      }
    })
    return list
  },
  async get(name: string) {
    const id = koobooContext.resourceMetadata.api[name]?.id
    if (!id) {
      throw new Error(`Api ${name} not found`)
    }
    const resource = await codeApi.getEdit('Api', id)
    koobooContext.resourceMetadata.api[name] = {
      id: resource.id,
      version: resource.version,
      name: resource.name
    }
    return resource
  },
  async getById(id: string) {
    const resource = await codeApi.getEdit('Api', id)
    koobooContext.resourceMetadata.api[resource.name] = {
      id: resource.id,
      version: resource.version,
      name: resource.name
    }
    return resource
  },
  async save(name: string, body: string, url: string) {
    const metadata = koobooContext.resourceMetadata.api?.[name]
    const version = metadata?.version ? metadata.version + 1 : 0
    const id = await codeApi.post({
      id: metadata?.id ?? emptyGuid,
      name,
      body,
      config: '',
      url,
      codeType: 'Api',
      version,
      scriptType: 'Module',
      isEmbedded: false,
      isDecrypted: false,
      enableDiffChecker: false
    })
    koobooContext.resourceMetadata.api[name] = {
      id,
      version,
      name
    }
  },
  async delete(name: string) {
    const metadata = koobooContext.resourceMetadata.api?.[name]
    if (!metadata) return
    await codeApi.deletes([metadata.id])
    delete koobooContext.resourceMetadata.api[name]
  }
}

export const codeblock = {
  async getList() {
    const list = await codeApi.getListByType('CodeBlock')
    list.forEach((item) => {
      koobooContext.resourceMetadata.codeblock[item.name] = {
        id: item.id,
        version: item.version || 0,
        name: item.name
      }
    })
    return list
  },
  async get(name: string) {
    const id = koobooContext.resourceMetadata.codeblock[name]?.id
    if (!id) {
      throw new Error(`CodeBlock ${name} not found`)
    }
    const resource = await codeApi.getEdit('CodeBlock', id)
    koobooContext.resourceMetadata.codeblock[name] = {
      id: resource.id,
      version: resource.version,
      name: resource.name
    }
    return resource
  },
  async getById(id: string) {
    const resource = await codeApi.getEdit('CodeBlock', id)
    koobooContext.resourceMetadata.codeblock[resource.name] = {
      id: resource.id,
      version: resource.version,
      name: resource.name
    }
    return resource
  },
  async save(name: string, body: string) {
    const metadata = koobooContext.resourceMetadata.codeblock?.[name]
    const version = metadata?.version ? metadata.version + 1 : 0

    const id = await codeApi.post({
      id: metadata?.id ?? emptyGuid,
      name,
      body,
      config: '',
      url: '',
      codeType: 'CodeBlock',
      version,
      scriptType: 'Module',
      isEmbedded: false,
      isDecrypted: false,
      enableDiffChecker: false
    })
    koobooContext.resourceMetadata.codeblock[name] = {
      id,
      version,
      name
    }
  },
  async delete(name: string) {
    const metadata = koobooContext.resourceMetadata.codeblock?.[name]
    if (!metadata) return
    await codeApi.deletes([metadata.id])
    delete koobooContext.resourceMetadata.codeblock[name]
  }
}

export const pagescript = {
  async getList() {
    const list = await codeApi.getListByType('PageScript')
    const result = list.filter((item) => {
      if (item.name.startsWith(' \n') || item.name.startsWith('\n') || item.name.startsWith(' ')) {
        return false
      }
      koobooContext.resourceMetadata.pagescript[item.name] = {
        id: item.id,
        version: item.version || 0,
        name: item.name
      }
      return true
    })
    return result
  },
  async get(name: string) {
    const id = koobooContext.resourceMetadata.pagescript[name]?.id
    if (!id) {
      throw new Error(`PageScript ${name} not found`)
    }
    const resource = await codeApi.getEdit('PageScript', id)
    koobooContext.resourceMetadata.pagescript[name] = {
      id: resource.id,
      version: resource.version,
      name: resource.name
    }
    return resource
  },
  async getById(id: string) {
    const resource = await codeApi.getEdit('PageScript', id)
    koobooContext.resourceMetadata.pagescript[resource.name] = {
      id: resource.id,
      version: resource.version,
      name: resource.name
    }
    return resource
  },
  async save(name: string, body: string) {
    const metadata = koobooContext.resourceMetadata.pagescript?.[name]
    const version = metadata?.version ? metadata.version + 1 : 0

    const id = await codeApi.post({
      id: metadata?.id ?? emptyGuid,
      name,
      body,
      config: '',
      url: '',
      codeType: 'PageScript',
      version,
      scriptType: 'Module',
      isEmbedded: false,
      isDecrypted: false,
      enableDiffChecker: false
    })
    koobooContext.resourceMetadata.pagescript[name] = {
      id,
      version,
      name
    }
  },
  async delete(name: string) {
    const metadata = koobooContext.resourceMetadata.pagescript?.[name]
    if (!metadata) return
    await codeApi.deletes([metadata.id])
    delete koobooContext.resourceMetadata.pagescript[name]
  }
}

export const layout = {
  async getList() {
    const list = await layoutApi.getList()
    list.forEach((item) => {
      koobooContext.resourceMetadata.layout[item.name] = {
        id: item.id,
        version: 0,
        name: item.name
      }
    })
    return list
  },
  async get(name: string) {
    const id = koobooContext.resourceMetadata.layout[name]?.id
    if (!id) {
      throw new Error(`Layout ${name} not found`)
    }
    const resource = await layoutApi.getEdit(id)
    koobooContext.resourceMetadata.layout[name] = {
      id: resource.id,
      version: resource.version,
      name: resource.name
    }
    return resource
  },
  async getById(id: string) {
    const resource = await layoutApi.getEdit(id)
    koobooContext.resourceMetadata.layout[resource.name] = {
      id: resource.id,
      version: resource.version,
      name: resource.name
    }
    return resource
  },
  async save(name: string, body: string) {
    const metadata = koobooContext.resourceMetadata.layout[name]
    const version = metadata?.version ? metadata.version + 1 : 0
    const id = await layoutApi.post({
      id: metadata?.id ?? emptyGuid,
      name,
      body,
      version,
      enableDiffChecker: false
    })
    koobooContext.resourceMetadata.layout[name] = {
      id,
      version,
      name
    }
  },
  async delete(name: string) {
    const metadata = koobooContext.resourceMetadata.layout[name]
    if (!metadata) return
    await layoutApi.deletes([metadata.id])
    delete koobooContext.resourceMetadata.layout[name]
  }
}

export const page = {
  async getList() {
    const list = await pageApi.getList()
    list.forEach((item) => {
      koobooContext.resourceMetadata.page[item.name] = {
        id: item.id,
        version: 0,
        name: item.name
      }
    })
    return list
  },
  async get(name: string) {
    const id = koobooContext.resourceMetadata.page[name]?.id
    if (!id) {
      throw new Error(`Page ${name} not found`)
    }
    const resource = await pageApi.getEdit(id)
    koobooContext.resourceMetadata.page[name] = {
      id: resource.id,
      version: resource.version,
      name: resource.name
    }
    return resource
  },
  async getById(id: string) {
    const resource = await pageApi.getEdit(id)
    koobooContext.resourceMetadata.page[resource.name] = {
      id: resource.id,
      version: resource.version,
      name: resource.name
    }
    return resource
  },
  async save(name: string, body: string, url: string) {
    const metadata = koobooContext.resourceMetadata.page[name]
    const version = metadata?.version ? metadata.version + 1 : 0
    const id = await pageApi.post({
      id: metadata?.id ?? emptyGuid,
      name,
      body,
      urlPath: url,
      version,
      enableDiffChecker: false,
      published: true
    })
    koobooContext.resourceMetadata.page[name] = {
      id,
      version,
      name
    }
  },
  async delete(name: string) {
    const metadata = koobooContext.resourceMetadata.page[name]
    if (!metadata) return
    await pageApi.deletes([metadata.id])
    delete koobooContext.resourceMetadata.page[name]
  }
}

export const script = {
  async getList() {
    const list = await scriptApi.getList()
    list.forEach((item) => {
      koobooContext.resourceMetadata.script[item.name] = {
        id: item.id,
        version: 0,
        name: item.name
      }
    })
    return list
  },
  async get(name: string) {
    const id = koobooContext.resourceMetadata.script[name]?.id
    if (!id) {
      throw new Error(`Script ${name} not found`)
    }
    const resource = await scriptApi.getEdit(id)
    koobooContext.resourceMetadata.script[name] = {
      id: resource.id,
      version: resource.version,
      name: resource.name
    }
    return resource
  },
  async getById(id: string) {
    const resource = await scriptApi.getEdit(id)
    koobooContext.resourceMetadata.script[resource.name] = {
      id: resource.id,
      version: resource.version,
      name: resource.name
    }
    return resource
  },
  async save(name: string, body: string) {
    const metadata = koobooContext.resourceMetadata.script[name]
    const version = metadata?.version ? metadata.version + 1 : 0
    const id = await scriptApi.post({
      id: metadata?.id ?? emptyGuid,
      name,
      body,
      extension: 'js',
      isEmbedded: false,
      ownerObjectId: '',
      version,
      enableDiffChecker: false
    })
    koobooContext.resourceMetadata.script[name] = {
      id,
      version,
      name
    }
  },
  async delete(name: string) {
    const metadata = koobooContext.resourceMetadata.script[name]
    if (!metadata) return
    await scriptApi.deletes([metadata.id])
    delete koobooContext.resourceMetadata.script[name]
  }
}

export const style = {
  async getList() {
    const list = await styleApi.getList()
    list.forEach((item) => {
      koobooContext.resourceMetadata.style[item.name] = {
        id: item.id,
        version: 0,
        name: item.name
      }
    })
    return list
  },
  async get(name: string) {
    const id = koobooContext.resourceMetadata.style[name]?.id
    if (!id) {
      throw new Error(`Style ${name} not found`)
    }
    const resource = await styleApi.getEdit(id)
    koobooContext.resourceMetadata.style[name] = {
      id: resource.id,
      version: resource.version,
      name: resource.name
    }
    return resource
  },
  async getById(id: string) {
    const resource = await styleApi.getEdit(id)
    koobooContext.resourceMetadata.style[resource.name] = {
      id: resource.id,
      version: resource.version,
      name: resource.name
    }
    return resource
  },
  async save(name: string, body: string) {
    const metadata = koobooContext.resourceMetadata.style[name]
    const version = metadata?.version ? metadata.version + 1 : 0
    const id = await styleApi.post({
      id: metadata?.id ?? emptyGuid,
      name,
      body,
      version,
      extension: 'css',
      isEmbedded: false,
      ownerObjectId: '',
      enableDiffChecker: false
    })
    koobooContext.resourceMetadata.style[name] = {
      id,
      version,
      name
    }
  },
  async delete(name: string) {
    const metadata = koobooContext.resourceMetadata.style[name]
    if (!metadata) return
    await styleApi.deletes([metadata.id])
    delete koobooContext.resourceMetadata.style[name]
  }
}

export const view = {
  async getList() {
    const list = await viewApi.getList()
    list.forEach((item) => {
      koobooContext.resourceMetadata.view[item.name] = {
        id: item.id,
        version: 0,
        name: item.name
      }
    })
    return list
  },
  async get(name: string) {
    const id = koobooContext.resourceMetadata.view[name]?.id
    if (!id) {
      throw new Error(`View ${name} not found`)
    }
    const resource = await viewApi.getEdit(id)
    koobooContext.resourceMetadata.view[name] = {
      id: resource.id,
      version: resource.version,
      name: resource.name
    }
    return resource
  },
  async getById(id: string) {
    const resource = await viewApi.getEdit(id)
    koobooContext.resourceMetadata.view[resource.name] = {
      id: resource.id,
      version: resource.version,
      name: resource.name
    }
    return resource
  },
  async save(name: string, body: string) {
    const metadata = koobooContext.resourceMetadata.view[name]
    const version = metadata?.version ? metadata.version + 1 : 0
    const id = await viewApi.post({
      id: metadata?.id ?? emptyGuid,
      name,
      body,
      version,
      enableDiffChecker: false
    })
    koobooContext.resourceMetadata.view[name] = {
      id,
      version,
      name
    }
  },
  async delete(name: string) {
    const metadata = koobooContext.resourceMetadata.view[name]
    if (!metadata) return
    await viewApi.deletes([metadata.id])
    delete koobooContext.resourceMetadata.view[name]
  }
}

export const module = {
  async getList() {
    const list = await moduleApi.getModuleList()
    list.forEach((item) => {
      koobooContext.moduleResourceMetadata[item.name] = {
        id: item.id,
        name: item.name
      }
    })
    return list
  },
  async delete(moduleName: string) {
    const metadata = koobooContext.moduleResourceMetadata[moduleName]
    if (!metadata) return
    await moduleApi.deleteModules([metadata.id])
    delete koobooContext.moduleResourceMetadata[moduleName]
  },
  async getFileList(moduleName: string) {
    const metadata = koobooContext.moduleResourceMetadata[moduleName]
    if (!metadata) {
      throw new Error(`Module ${moduleName} not found`)
    }
    const list = await moduleApi.getModuleAllFiles(metadata.id)
    return list
  },
  async getFileText(
    moduleName: string,
    moduleResourceType: ModuleResourceType,
    fileName: string,
    folderName: string = '/'
  ) {
    const text = await moduleApi.getFileText({
      objectType: moduleResourceType,
      fileName,
      folder: folderName,
      moduleName
    })
    return text
  },
  async saveFileText(
    moduleName: string,
    moduleResourceType: ModuleResourceType,
    fileName: string,
    content: string,
    folderName: string = '/'
  ) {
    await moduleApi.updateFileText({
      objectType: moduleResourceType,
      fileName,
      folder: folderName,
      content,
      moduleName
    })
  },
  async deleteFile(moduleName: string, moduleResourceType: ModuleResourceType, fileName: string, folderName: string = '/') {
    await moduleApi.removeFile({
      objectType: moduleResourceType,
      fileName,
      folder: folderName,
      moduleName
    })
  }
}

export async function loadResourceList() {
  const resourceList = await Promise.all([
    { type: 'api', list: await api.getList() },
    { type: 'codeblock', list: await codeblock.getList() },
    { type: 'layout', list: await layout.getList() },
    { type: 'page', list: await page.getList() },
    { type: 'script', list: await script.getList() },
    { type: 'style', list: await style.getList() },
    { type: 'view', list: await view.getList() },
    { type: 'pagescript', list: await pagescript.getList() }
  ])
  return resourceList
}
