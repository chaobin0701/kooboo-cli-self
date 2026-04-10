import { getClient, ClientType } from '../../http/client.js'
import { PageItem, Page } from '../../types/page.js'

export async function getList(): Promise<PageItem[]> {
  const client = getClient(ClientType.SITE)
  const { data } = await client.get('Page/all')
  return data
}

export async function deletes(ids: string[]): Promise<void> {
  const client = getClient(ClientType.SITE)
  const { data } = await client.post('Page/Deletes', { ids })
  return data
}

export async function getEdit(
  id: string,
  args?: Record<string, string>
): Promise<Page> {
  const client = getClient(ClientType.SITE)
  const { data } = await client.get('Page/GetEdit', { params: { id, ...args } })
  return data
}

export async function isUniqueName(name: string): Promise<boolean> {
  const client = getClient(ClientType.SITE)
  const { data } = await client.get('Page/isUniqueName', { params: { name } })
  return data
}

export async function pageUrlIsUniqueName(
  name: string,
  oldName?: string
): Promise<boolean> {
  const client = getClient(ClientType.SITE)
  const { data } = await client.get('Page/isUniqueRoute', {
    params: { name, oldName }
  })
  return data
}

export async function post(body: Page): Promise<string> {
  const client = getClient(ClientType.SITE)
  const { data } = await client.post('Page/post', body)
  return data
}
