import { koobooContext } from '../config/context.js'
import { getClient, ClientType } from '../http/client.js'
import type { LabelItem, LabelUpsertPayload } from '../types/label.js'

function resolveSiteId(siteId?: string) {
  const resolvedSiteId = siteId || koobooContext.getConfig().siteId
  if (!resolvedSiteId) {
    throw new Error('SiteId is required to manage labels')
  }
  return resolvedSiteId
}

function normalizeLabelListResponse(data: unknown): LabelItem[] {
  if (Array.isArray(data)) {
    return data as LabelItem[]
  }

  if (data && typeof data === 'object') {
    const maybeData = data as {
      data?: unknown
      labels?: unknown
      list?: unknown
      items?: unknown
      siteLabels?: unknown
    }

    if (Array.isArray(maybeData.data)) return maybeData.data as LabelItem[]
    if (Array.isArray(maybeData.labels)) return maybeData.labels as LabelItem[]
    if (Array.isArray(maybeData.list)) return maybeData.list as LabelItem[]
    if (Array.isArray(maybeData.items)) return maybeData.items as LabelItem[]
    if (Array.isArray(maybeData.siteLabels)) return maybeData.siteLabels as LabelItem[]
  }

  return []
}

export async function getLabelList(siteId?: string) {
  const client = getClient(ClientType.SITE)
  const resolvedSiteId = resolveSiteId(siteId)
  const { data } = await client.get('/Label/list', {
    params: {
      SiteId: resolvedSiteId
    }
  })
  return normalizeLabelListResponse(data)
}

export async function upsertLabel(label: LabelUpsertPayload, siteId?: string) {
  const client = getClient(ClientType.SITE)
  const resolvedSiteId = resolveSiteId(siteId)
  const { data } = await client.post('/Label/create', label, {
    params: {
      SiteId: resolvedSiteId
    }
  })
  return data
}

export async function importLabelFile(
  fileContent: string | Record<string, unknown>,
  fileName = 'labels.json',
  siteId?: string
) {
  const client = getClient(ClientType.SITE)
  const resolvedSiteId = resolveSiteId(siteId)
  const content =
    typeof fileContent === 'string' ? fileContent : JSON.stringify(fileContent, null, 2)
  const formData = new FormData()
  const file = new File([content], fileName, {
    type: 'application/json'
  })
  formData.append('file', file)

  const { data } = await client.post('/Label/Import', formData, {
    params: {
      SiteId: resolvedSiteId
    },
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return data
}
