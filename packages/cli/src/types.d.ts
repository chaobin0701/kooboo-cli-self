export type AuthOptions = {
  siteUrl?: string
  username?: string
  password?: string
}

export type ExportActionOptions = AuthOptions & {
  file?: string
}

export type SyncActionOptions = AuthOptions & {
  init?: boolean
  commonModulePath?: string
}

export type ExportStoreNameDto = {
  name: string
  displayName: string
}
