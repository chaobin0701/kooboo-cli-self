import { getClient, ClientType } from '../../http/client.js'
import { Script, ScriptItem } from '../../types/script.js'

export async function getList(): Promise<ScriptItem[]> {
  const client = getClient(ClientType.SITE)
  const { data } = await client.get('Script/External')
  return data
}

export async function getEdit(id: string): Promise<Script> {
  const client = getClient(ClientType.SITE)
  const { data } = await client.get('Script/Get', { params: { id } })
  return data
}

export async function post(body: Script): Promise<string> {
  const client = getClient(ClientType.SITE)
  const { data } = await client.post('Script/Update', body)
  return data
}

export async function deletes(ids: string[]): Promise<void> {
  const client = getClient(ClientType.SITE)
  const { data } = await client.post('Script/Deletes', { ids })
  return data
}

export async function isUniqueName(name: string): Promise<boolean> {
  const client = getClient(ClientType.SITE)
  const { data } = await client.get('Script/isUniqueName', { params: { name } })
  return data
}
