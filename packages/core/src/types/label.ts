export interface LabelItem {
  id: string
  name: string
  values: Record<string, string>
  lastModified?: string
  keyHash?: string
  storeNameHash?: number
  relations?: Record<string, number>
  relationDetails?: unknown[]
  [key: string]: unknown
}

export interface LabelUpsertPayload {
  key: string
  values: Record<string, string>
}

