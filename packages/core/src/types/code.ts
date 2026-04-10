export type CodeType = 'Api' | 'CodeBlock' | 'PageScript'

// export interface Code<T extends CodeType> {
//   id: string
//   name: string
//   body: string
//   config: string
//   url: string

//   codeType: T
//   version: number

//   eventType: string
//   scriptType: string
//   isEmbedded?: boolean
//   isDecrypted?: boolean
//   enableDiffChecker: boolean
// }

export interface Code<T extends CodeType> {
  id: string
  name: string
  body: string
  config: string
  url: string
  codeType: T
  version: number
  eventType?: string
  scriptType: 'Module'
  isEmbedded: boolean
  isDecrypted: boolean
  enableDiffChecker: boolean
}

export interface CodeItem<T extends CodeType> {
  codeType: T
  eventType: null
  id: string
  isEmbedded: boolean
  keyHash: string
  lastModified: string
  name: string
  previewUrl: null
  references: {}
  scriptType: 'Module'
  storeNameHash: number
  url: T extends 'Api' ? string : null
  version: number
}
