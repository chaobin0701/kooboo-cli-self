export interface View {
  body: string
  dummyLayout?: string
  layouts?: Record<string, string>
  name: string
  id: string
  version: number
  enableDiffChecker: boolean
  propDefines?: any[]
}

// export interface View {
//   dataSourceCount: number
//   id: string
//   keyHash: string
//   lastModified: string
//   name: string
//   preview: string
//   relations: Record<string, number>
//   storeNameHash: number
//   version: number
// }

export interface ViewItem {
  dataSourceCount: number
  id: string
  keyHash: string
  lastModified: string
  name: string
  preview: string
  relations: {}
  relativeUrl: string
  storeNameHash: number
}
