import { getClient, ClientType } from '../../http/client.js'
import { ViewItem, View } from '../../types/view.js'

export async function getList(): Promise<ViewItem[]> {
  const client = getClient(ClientType.SITE)
  const { data } = await client.get('View/list')
  return data
}

export async function deletes(ids: string[]): Promise<void> {
  const client = getClient(ClientType.SITE)
  const { data } = await client.post('View/Deletes', { ids })
  return data
}

export async function isUniqueName(name: string): Promise<boolean> {
  const client = getClient(ClientType.SITE)
  const { data } = await client.get('View/isUniqueName', { params: { name } })
  return data
}

export async function post(body: View): Promise<string> {
  const client = getClient(ClientType.SITE)
  const { data } = await client.post('View/post', body)
  return data
}

export async function getEdit(id: string): Promise<View> {
  const client = getClient(ClientType.SITE)
  const { data } = await client.get('View/get', { params: { id } })
  return data
}
