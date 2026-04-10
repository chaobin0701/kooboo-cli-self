import { getClient, ClientType } from '../../http/client.js'
import { Layout, LayoutItem } from '../../types/layout.js'

export async function getLayout(
  id: string,
  args?: Record<string, any>
): Promise<Layout> {
  const client = getClient(ClientType.SITE)
  const { data } = await client.get('Layout/get', { params: { id, ...args } })
  return data
}

export async function getList(): Promise<LayoutItem[]> {
  const client = getClient(ClientType.SITE)
  const { data } = await client.get('Layout/list')
  return data
}

export async function getEdit(id: string): Promise<Layout> {
  const client = getClient(ClientType.SITE)
  const { data } = await client.get('Layout/get', { params: { id } })
  return data
}

export async function post(body: Layout): Promise<string> {
  const client = getClient(ClientType.SITE)
  const { data } = await client.post('Layout/post', body)
  return data
}

export async function deletes(ids: string[]): Promise<void> {
  const client = getClient(ClientType.SITE)
  const { data } = await client.post('Layout/Deletes', { ids })
  return data
}

export async function isUniqueName(name: string): Promise<boolean> {
  const client = getClient(ClientType.SITE)
  const { data } = await client.get('Layout/isUniqueName', { params: { name } })
  return data
}
