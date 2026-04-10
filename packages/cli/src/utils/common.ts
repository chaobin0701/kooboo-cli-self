import ora from 'ora'
import type { AuthOptions } from '../types'
import { auth } from '@kooboo/core'
import { upsertLine } from './writeFile'
import { resolve } from 'path'

/**
 * Make sure user if logged in
 * use specific siteUrl, username, password to login
 * if not specific, use default KOOBOO_SITE_URL, KOOBOO_USERNAME, KOOBOO_PASSWORD to login
 */
export async function ensureLogin<T extends AuthOptions>(options: T) {
  const siteUrl = options.siteUrl || process.env.KOOBOO_SITE_URL
  const username = options.username || process.env.KOOBOO_USERNAME
  const password = options.password || process.env.KOOBOO_PASSWORD

  if (!username || !password || !siteUrl) {
    ora('KOOBOO_SITE_URL, KOOBOO_USERNAME or KOOBOO_PASSWORD is missing').fail()
    return false
  }

  const identifyUserSpinner = ora(`Authenticating user ${username}...`).start()
  try {
    const token = await auth.loginBySite(siteUrl, { username, password })
    identifyUserSpinner.succeed(`User ${username} authenticated successfully!`)

    const envFile = resolve(process.cwd(), '.env')
    upsertLine(envFile, `KOOBOO_TOKEN=${token}`, (line) => line.startsWith('KOOBOO_TOKEN'))

    return token
  } catch (error) {
    identifyUserSpinner.fail(`Failed to authenticate user ${username}!\n${error}`)
    return false
  }
}
