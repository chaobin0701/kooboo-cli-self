import { getClient, ClientType } from '../../http/client.js'
import { Style, StyleItem } from '../../types/style.js'

export async function getList(): Promise<StyleItem[]> {
  const client = getClient(ClientType.SITE)
  const { data } = await client.get('Style/External')
  return data
}

export async function getEdit(id: string): Promise<Style> {
  const client = getClient(ClientType.SITE)
  const { data } = await client.get('Style/Get', { params: { id } })
  return data
}

export async function post(body: Style): Promise<string> {
  const client = getClient(ClientType.SITE)
  const { data } = await client.post('Style/Update', body)
  return data
}

export async function deletes(ids: string[]): Promise<void> {
  const client = getClient(ClientType.SITE)
  const { data } = await client.post('Style/Deletes', { ids })
  return data
}

export async function isUniqueName(name: string): Promise<boolean> {
  const client = getClient(ClientType.SITE)
  const { data } = await client.get('Style/isUniqueName', { params: { name } })
  return data
}
