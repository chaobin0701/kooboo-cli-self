import { getClient, ClientType } from '../../http/client.js'

import { Code, CodeItem, CodeType } from '../../types/code.js'

export async function getListByType<
  T extends 'Api' | 'CodeBlock' | 'PageScript'
>(codeType: T): Promise<CodeItem<T>[]> {
  const client = getClient(ClientType.SITE)
  const { data } = await client.get('Code/ListByType', {
    params: { codeType }
  })
  return data
}

export async function getTypes(): Promise<Record<string, string>> {
  const client = getClient(ClientType.SITE)
  const { data } = await client.get('Code/CodeType')
  return data
}

export async function getEdit<T extends CodeType>(
  codeType: T,
  id: string
): Promise<Code<T>> {
  const client = getClient(ClientType.SITE)
  const { data } = await client.get('Code/GetEdit', {
    params: { codeType, id }
  })
  return data
}

export async function getByName<T extends CodeType>(
  name: string
): Promise<Code<T>> {
  const client = getClient(ClientType.SITE)
  const { data } = await client.get('Code/GetByName', {
    params: { name }
  })
  return data
}

export async function post<T extends CodeType>(body: Code<T>): Promise<any> {
  const client = getClient(ClientType.SITE)

  const { data } = await client.post('Code/post', body)
  return data
}

export async function deletes(ids: string[]) {
  const client = getClient(ClientType.SITE)
  const { data } = await client.post('Code/Deletes', { ids })
  return data
}

export async function isUniqueName(name: string) {
  const client = getClient(ClientType.SITE)
  const { data } = await client.get('Code/isUniqueName', {
    params: { name }
  })
  return data
}
