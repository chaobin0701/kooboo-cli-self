import { syncPush } from '@kooboo/sync'
import { resolve } from 'node:path'
import { type SyncActionOptions } from '../types'

export function syncAction(options: SyncActionOptions) {
  const siteUrl = options?.siteUrl || process.env.KOOBOO_SITE_URL
  const username = options?.username || process.env.KOOBOO_USERNAME
  const password = options?.password || process.env.KOOBOO_PASSWORD
  if (!siteUrl || !username || !password) {
    throw new Error('KOOBOO_SITE_URL, KOOBOO_USERNAME, KOOBOO_PASSWORD is required')
  }
  syncPush({
    init: options?.init,
    commonModulePath: options?.commonModulePath
      ? resolve(process.cwd(), options.commonModulePath)
      : undefined,
    siteUrl,
    auth: {
      username,
      password
    }
  })
}
