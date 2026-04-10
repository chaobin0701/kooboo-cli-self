import { getClient, ClientType } from '../../http/client.js'
import {
  GetModuleResource,
  ModuleFile,
  ModuleItem,
  ModuleResource
} from '../../types/module.js'

export async function getModuleList(): Promise<ModuleItem[]> {
  const client = getClient(ClientType.SITE)
  const { data } = await client.get('ScriptModule/list', {
    params: {
      devMode: true
    }
  })
  return data
}

export async function deleteModules(moduleIds: string[]): Promise<null> {
  const client = getClient(ClientType.SITE)
  await client.post('ScriptModule/Deletes', {
    ids: moduleIds
  })
  return null
}

export async function getModuleAllFiles(
  moduleId: string
): Promise<ModuleFile[]> {
  const client = getClient(ClientType.SITE)
  const { data } = await client.get('ModuleFiles/AllFiles', {
    params: {
      moduleid: moduleId
    }
  })
  return data
}

export async function getFileText(params: GetModuleResource): Promise<string> {
  const client = getClient(ClientType.SITE)
  const { data } = await client.post('ModuleFiles/GetText', params)
  return data
}

export async function updateFileText(params: ModuleResource): Promise<null> {
  const client = getClient(ClientType.SITE)
  await client.post('ModuleFiles/UpdateText', params)
  return null
}

export async function removeFile(params: GetModuleResource): Promise<null> {
  const client = getClient(ClientType.SITE)
  await client.post('ModuleFiles/Remove', params)
  return null
}
