import { checkConfigKey, getConfig, setConfig } from '../utils/config.js'
import type { KoobooCliConfig } from '../utils/config.js'
import ora from 'ora'
import {
  pullSiteConfigAction,
  pushSiteConfigAction,
  showSiteConfigAction
} from './siteConfig.js'

export type ConfigActionOptions = {
  global?: true
  siteUrl?: string
  username?: string
  password?: string
}

export async function configAction(
  key?: keyof KoobooCliConfig | 'site',
  value?: string,
  options?: ConfigActionOptions
) {
  if (key === 'site') {
    if (!value) {
      ora('Usage: kbs config site <pull|push|show>').fail()
      return
    }
    if (value === 'pull') {
      await pullSiteConfigAction(options)
      return
    }
    if (value === 'push') {
      await pushSiteConfigAction(options)
      return
    }
    if (value === 'show') {
      await showSiteConfigAction()
      return
    }
    ora(`Unknown site config command: ${value}`).fail()
    return
  }

  const target = !!options?.global ? 'global' : 'project'

  if (!key) {
    const config = getConfig(target)
    if (!config) {
      ora(
        `No config found for ${target}, please run 'kbs config ${key} <value>' to set config`
      ).fail()
      return
    }
    console.log(config)
    return
  }
  if (!checkConfigKey(key)) {
    ora(`Invalid config key: ${key}`).fail()
    return
  }
  if (value) {
    setConfig({ [key]: value }, target)
  } else {
    const config = getConfig(target)
    if (!config) {
      ora(
        `No config found for ${target}, please run 'kbs config ${key} <value>' to set config`
      ).fail()
      return
    }
    console.log(config[key])
  }
}
